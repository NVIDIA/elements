// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const nonAscii = /[^\x00-\x7f]/;

function instantiate(source, match, outer, flags) {
  const expanded = source.replace(
    /\\([1-9][0-9]*)/g,
    (_, number) => `(?:${escapeRegExp(match[outer + Number(number)] ?? '')})`
  );
  return new RegExp(expanded, flags);
}

/** @hotPath */
function execute(regex, line, cursor, base) {
  if (!regex) return null;
  regex.lastIndex = cursor - base;
  const match = regex.exec(line);
  if (!match) return null;
  match.index += base;
  return match;
}

export function createScanner(machine) {
  const ruleMask = machine.ruleMask ?? -1;
  const expressions = [];
  const asciiExpressions = machine.expressions?.some(entry => entry[2]) ? [] : null;
  const matcher = (source, flags, ascii) => {
    if (typeof source !== 'number') return source ? new RegExp(source, flags) : 0;
    if (source < 0) return 0;
    const entry = machine.expressions[source];
    const specialized = ascii && entry[2];
    if (entry[1] & 2) flags = flags.replace('d', '');
    return ((specialized ? asciiExpressions : expressions)[source] ??= new RegExp(specialized || entry[0], flags));
  };
  const regexes = [];
  const stickyRegexes = [];
  const delayedRegexes = [];
  const asciiRegexes = [];
  const asciiStickyRegexes = [];
  const asciiDelayedRegexes = [];

  /** @hotPath */
  function branchFor(match, branches) {
    for (let i = 0; i < branches.length; i += 2) {
      if (match[branches[i]] !== undefined) return i;
    }
    throw new Error('Combined regex matched without a branch');
  }

  /** @hotPath */
  const scan = function scan(text, checkpoint, checkpoints, onLine, checkpointStride = 1) {
    const spans = [];
    const stack = checkpoint ? checkpoint[3].slice() : [];
    let boundary = stack.length ? (stack.at(-1)[7] ? stack.length - 1 : stack.at(-1)[8]) : -1;
    let state = checkpoint?.[1] ?? machine.firstState ?? 0;
    if (checkpoint?.[0] && state === machine.firstState) state = 0;
    let category = checkpoint?.[2] ?? 0;
    let cursor = checkpoint?.[0] ?? 0;
    let lineStart = cursor;
    let lineNumber = checkpoint?.[4] ?? 0;
    if (checkpoint && cursor !== 0 && text[cursor - 1] !== '\n') {
      throw new Error('Scanner checkpoint must start at a line boundary');
    }
    let lineLimit = text.indexOf('\n', lineStart) + 1 || text.length;
    let line = text.slice(lineStart, lineLimit);
    let asciiLine = asciiExpressions && !nonAscii.test(line);
    let checkedLine = -1;
    let endFrame;
    let endLine = -1;
    let endMatch = null;
    if (checkpoints || onLine) {
      const lineState = [lineStart, state, category, stack.slice(), lineNumber];
      if (checkpoints) checkpoints.push(lineState);
      if (onLine?.(lineState)) return spans;
    }

    /** @hotPath */
    function emit(start, end, kind) {
      if (kind <= 0 || end <= start) return;
      const previous = spans[spans.length - 1];
      if (previous?.[1] === start && previous[2] === kind) previous[1] = end;
      else spans.push([start, end, kind]);
    }

    /** @hotPath */
    function emitMatch(match, start, end, kind, captures, outer = 0) {
      if (!captures.length) {
        emit(start, end, kind);
        return;
      }
      if (captures.length === 2 && captures[0] === 0) {
        emit(start, end, captures[1]);
        return;
      }
      if (captures.length === 2) {
        const pair = match.indices[captures[0] + outer];
        if (pair && pair[0] + lineStart === start && pair[1] + lineStart === end) {
          emit(start, end, captures[1]);
          return;
        }
      }
      const sections = [];
      const boundaries = [start, end];
      for (let i = 0; i < captures.length; i += 2) {
        if (captures[i] === 0) {
          sections.push([start, end, captures[i + 1]]);
          continue;
        }
        const pair = match.indices[captures[i] + outer];
        if (pair && pair[1] > pair[0]) {
          const from = pair[0] + lineStart;
          const to = pair[1] + lineStart;
          sections.push([from, to, captures[i + 1]]);
          boundaries.push(from, to);
        }
      }
      boundaries.sort((a, b) => a - b);
      for (let i = 1; i < boundaries.length; i++) {
        const from = boundaries[i - 1];
        const to = boundaries[i];
        if (to === from) continue;
        let chosen = kind;
        let width = Infinity;
        for (const [captureStart, captureEnd, captureKind] of sections) {
          if (captureStart <= from && captureEnd >= to && captureEnd - captureStart <= width) {
            chosen = captureKind;
            width = captureEnd - captureStart;
          }
        }
        emit(from, to, chosen);
      }
    }

    while (cursor < text.length) {
      if (cursor >= lineLimit) {
        if (state === machine.firstState) state = 0;
        lineStart = lineLimit;
        lineNumber++;
        const newline = text.indexOf('\n', lineStart);
        lineLimit = newline < 0 ? text.length : newline + 1;
        line = text.slice(lineStart, lineLimit);
        asciiLine = asciiExpressions && !nonAscii.test(line);
        if (checkpoints || onLine) {
          const lineState = [lineStart, state, category, stack.slice(), lineNumber];
          const retained = checkpoints && lineNumber % checkpointStride === 0;
          if (retained) checkpoints.push(lineState);
          if (onLine?.(lineState)) {
            if (checkpoints && !retained) checkpoints.push(lineState);
            return spans;
          }
        }
      }
      if (checkedLine !== lineStart) {
        checkedLine = lineStart;
        for (let i = 0; i < stack.length; i++) {
          const region = stack[i];
          if (region[7] && i < stack.length - 1) {
            const closing = execute(region[2], line, cursor, lineStart);
            const stickyClosing = closing?.index === cursor ? null : execute(region[6], line, cursor, lineStart);
            if (closing?.index === cursor || stickyClosing?.index === cursor) {
              state = stack[i + 1][0];
              category = stack[i + 1][1];
              stack.length = i + 1;
              boundary = i;
              break;
            }
          }
          const continuation = region[4];
          if (!continuation) continue;
          const match = execute(continuation, line, cursor, lineStart);
          if (!match || match.index + match[0].length > lineLimit) {
            state = region[0];
            category = region[1];
            stack.length = i;
            boundary = region[8];
            break;
          }
          emitMatch(match, cursor, cursor + match[0].length, stack[i + 1]?.[1] ?? category, region[5]);
          cursor += match[0].length;
        }
      }
      const stateData = machine.states[state];
      const searches = asciiLine ? asciiRegexes : regexes;
      const regex = (searches[state] ??= matcher(stateData[0], 'gdmu', asciiLine));
      const match = execute(regex, line, cursor, lineStart);
      const anchoredSearches = asciiLine ? asciiStickyRegexes : stickyRegexes;
      const stickyRegex = (anchoredSearches[state] ??= matcher(stateData[2], 'ydmu', asciiLine));
      const sticky = execute(stickyRegex, line, cursor, lineStart);
      let candidate = match;
      let candidateBranches = stateData[1];
      let candidateDelayed = false;
      if (
        sticky &&
        (!candidate ||
          sticky.index < candidate.index ||
          (sticky.index === candidate.index &&
            stateData[3][branchFor(sticky, stateData[3]) + 1] <
              candidateBranches[branchFor(candidate, candidateBranches) + 1]))
      ) {
        candidate = sticky;
        candidateBranches = stateData[3];
      }
      const advance = text.codePointAt(cursor) > 65535 ? 2 : 1;
      const delayed = execute(
        ((asciiLine ? asciiDelayedRegexes : delayedRegexes)[state] ??= matcher(stateData[4], 'gdmu', asciiLine)),
        line,
        cursor + advance,
        lineStart
      );
      if (
        delayed &&
        (!candidate ||
          delayed.index < candidate.index ||
          (delayed.index === candidate.index &&
            stateData[5][branchFor(delayed, stateData[5]) + 1] <
              candidateBranches[branchFor(candidate, candidateBranches) + 1]))
      ) {
        candidate = delayed;
        candidateBranches = stateData[5];
        candidateDelayed = true;
      }
      const frame = stack[stack.length - 1];
      let dynamic = null;
      if (frame?.[2] && !stateData[6]) {
        if (frame !== endFrame || endLine !== lineStart || (endMatch && endMatch.index < cursor)) {
          endFrame = frame;
          endLine = lineStart;
          endMatch = execute(frame[2], line, cursor, lineStart);
        }
        dynamic = endMatch;
      }
      if (frame?.[6] && !stateData[6]) {
        const anchoredEnd = execute(frame[6], line, cursor, lineStart);
        if (anchoredEnd && (!dynamic || anchoredEnd.index <= dynamic.index)) dynamic = anchoredEnd;
      }
      const useDynamic = dynamic && (!candidate || dynamic.index <= candidate.index);
      const selected = useDynamic ? dynamic : candidate;
      let closingBoundary = -1;
      let boundaryMatch = null;
      for (let i = boundary; i >= 0; i = stack[i][8]) {
        if (i === stack.length - 1) continue;
        const region = stack[i];
        const closing = execute(region[2], line, cursor, lineStart);
        const stickyClosing = execute(region[6], line, cursor, lineStart);
        const match = stickyClosing && (!closing || stickyClosing.index <= closing.index) ? stickyClosing : closing;
        if (
          match &&
          (!selected || match.index <= selected.index) &&
          (!boundaryMatch || match.index <= boundaryMatch.index)
        ) {
          closingBoundary = i;
          boundaryMatch = match;
        }
      }
      if (boundaryMatch && boundaryMatch.index < lineLimit) {
        emit(cursor, boundaryMatch.index, category);
        cursor = boundaryMatch.index;
        state = stack[closingBoundary + 1][0];
        category = stack[closingBoundary + 1][1];
        stack.length = closingBoundary + 1;
        boundary = closingBoundary;
        continue;
      }
      const delayedEndAtBoundary =
        candidateDelayed &&
        selected === candidate &&
        selected?.index === lineLimit &&
        machine.rules[candidateBranches[branchFor(candidate, candidateBranches) + 1] & ruleMask][0] === 2;
      if (
        !selected ||
        (selected.index >= lineLimit && !delayedEndAtBoundary) ||
        selected.index + selected[0].length > lineLimit
      ) {
        emit(cursor, lineLimit, category);
        cursor = lineLimit;
        continue;
      }

      emit(cursor, selected.index, category);
      const end = selected.index + selected[0].length;
      let popped = false;
      const priorState = state;
      if (useDynamic) {
        emitMatch(selected, selected.index, end, category, frame[3]);
        state = frame[0];
        category = frame[1];
        stack.pop();
        boundary = frame[8];
        popped = true;
      } else {
        const branches = candidateBranches;
        const branch = branchFor(selected, branches);
        const outer = branches[branch];
        const [
          action,
          next,
          kind,
          captures,
          endSource,
          endCaptures,
          whileSource,
          whileCaptures,
          stickyEndSource,
          hardEnd
        ] = machine.rules[branches[branch + 1] & ruleMask];
        const matchKind = action === 2 || action === 4 || kind < 0 ? category : kind || category;
        emitMatch(selected, selected.index, end, matchKind, captures, ruleMask < 0 ? 0 : outer);
        if (action === 1) {
          const dynamicEnd =
            typeof endSource === 'number'
              ? matcher(-endSource - 1, 'gdmu')
              : endSource
                ? instantiate(endSource, selected, outer, 'gdmu')
                : null;
          const stickyEnd = stickyEndSource ? instantiate(stickyEndSource, selected, outer, 'ydmu') : null;
          const continuation = whileSource ? instantiate(whileSource, selected, outer, 'ydmu') : null;
          stack.push([
            state === machine.firstState ? 0 : state,
            category,
            dynamicEnd,
            endCaptures,
            continuation,
            whileCaptures,
            stickyEnd,
            hardEnd,
            boundary
          ]);
          if (hardEnd) boundary = stack.length - 1;
          state = next;
          category = kind < 0 ? 0 : kind || category;
        } else if (action === 4 && frame) {
          state = next;
          category = kind < 0 ? 0 : kind || category;
          stack[stack.length - 1] = [
            frame[0],
            frame[1],
            endSource === 0
              ? frame[2]
              : typeof endSource === 'number'
                ? matcher(-endSource - 1, 'gdmu')
                : new RegExp(endSource, 'gdmu'),
            endCaptures,
            null,
            [],
            endSource === 0 ? frame[6] : null,
            hardEnd,
            frame[8]
          ];
          boundary = hardEnd ? stack.length - 1 : frame[8];
        } else if ((action === 2 || action === 3) && frame) {
          state = frame[0];
          category = frame[1];
          stack.pop();
          boundary = frame[8];
          popped = true;
        }
      }
      cursor = end > cursor ? end : popped || state !== priorState ? cursor : cursor + advance;
    }
    if (checkpoints && text.charCodeAt(text.length - 1) === 10 && lineStart !== text.length) {
      checkpoints.push([
        text.length,
        state === machine.firstState ? 0 : state,
        category,
        stack.slice(),
        lineNumber + 1
      ]);
    }
    return spans;
  };
  return scan;
}

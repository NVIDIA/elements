// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Branch values encode local priority above a shared transition index.
// Capture indexes become relative to the branch's wrapping capture.
export function compactRules(machine) {
  if (machine.ruleMask !== undefined) throw new Error('Transitions already compacted');
  const rules = [];
  const ids = new Map();
  const transition = new Map();
  for (const state of machine.states) {
    for (const offset of [1, 3, 5]) {
      const branches = state[offset] ?? [];
      for (let i = 0; i < branches.length; i += 2) {
        const original = branches[i + 1];
        const rule = machine.rules[original].slice();
        if (rule[0] === 2) rule[2] = 0;
        rule[3] = rule[3].map((value, index) => (index % 2 ? value : value - branches[i]));
        // End and continuation captures use standalone expressions. Keep their
        // empty capture arrays when those matchers can execute.
        if (rule.length === 8 && !rule[6]) rule.length = 6;
        if (rule.length === 6 && !rule[4] && !(rule[0] === 4 && rule[4] === 0)) rule.length = 4;
        const key = JSON.stringify(rule);
        if (!ids.has(key)) {
          ids.set(key, rules.length);
          rules.push(rule);
        }
        transition.set(original, ids.get(key));
      }
    }
  }
  const stride = 2 ** Math.ceil(Math.log2(Math.max(rules.length, 1)));
  const states = machine.states.map(state => {
    const priorities = new Map(
      [1, 3, 5]
        .flatMap(offset => (state[offset] ?? []).filter((_, index) => index % 2))
        .toSorted((a, b) => a - b)
        .map((id, index) => [id, index])
    );
    const result = state.slice();
    for (const offset of [1, 3, 5]) {
      if (!state[offset]) continue;
      result[offset] = state[offset].map((value, index) => {
        if (!(index % 2)) return value;
        const packed = priorities.get(value) * stride + transition.get(value);
        if (packed > 0x7fffffff) throw new Error('Transition priority exceeds packed integer limit');
        return packed;
      });
    }
    return result;
  });
  return mergeStates({ ...machine, states, rules, ruleMask: stride - 1 });
}

// Refine equivalence classes until child-state destinations stop changing.
// Region ends, categories, and continuations remain on push transitions/frames.
function mergeStates(machine) {
  const stride = machine.ruleMask + 1;
  let classes = machine.states.map(() => 0);
  const protectedStates = new Set(machine.roots?.map(([, first]) => first).filter(first => first >= 0));
  while (true) {
    let changed = true;
    while (changed) {
      const identities = new Map();
      const refined = machine.states.map((state, index) => {
        const signature = [
          state[0],
          state[2],
          state[4] ?? -1,
          state[6] ?? 0,
          index === machine.firstState,
          protectedStates.has(index) ? index : -1
        ];
        for (const offset of [1, 3, 5]) {
          const branches = state[offset] ?? [];
          signature.push(
            branches.map((value, i) => {
              if (!(i % 2)) return value;
              const rule = machine.rules[value & machine.ruleMask].slice();
              if (rule[1] >= 0) rule[1] = classes[rule[1]];
              return [Math.floor(value / stride), rule];
            })
          );
        }
        const key = JSON.stringify(signature);
        if (!identities.has(key)) identities.set(key, identities.size);
        return identities.get(key);
      });
      changed = refined.some((value, index) => value !== classes[index]);
      classes = refined;
    }
    // Scanner progress handling distinguishes a self transition from a state
    // change. Preserve that distinction even for zero-width region patterns.
    const unsafe = new Set();
    machine.states.forEach((state, index) => {
      for (const offset of [1, 3, 5]) {
        const branches = state[offset] ?? [];
        for (let i = 1; i < branches.length; i += 2) {
          const rule = machine.rules[branches[i] & machine.ruleMask];
          if ((rule[0] === 1 || rule[0] === 4) && rule[1] !== index && classes[rule[1]] === classes[index])
            unsafe.add(classes[index]);
        }
      }
    });
    if (!unsafe.size) break;
    classes.forEach((identity, index) => {
      if (unsafe.has(identity)) protectedStates.add(index);
    });
  }
  const representatives = [];
  classes.forEach((identity, index) => {
    representatives[identity] ??= machine.states[index];
  });
  const rules = [];
  const ids = new Map();
  // First collect transitions after rewriting their state destinations.
  const transitions = representatives.map(state =>
    [1, 3, 5].map(offset => {
      const branches = state[offset] ?? [];
      return branches.map((value, index) => {
        if (!(index % 2)) return value;
        const rule = machine.rules[value & machine.ruleMask].slice();
        if (rule[1] >= 0) rule[1] = classes[rule[1]];
        const key = JSON.stringify(rule);
        if (!ids.has(key)) {
          ids.set(key, rules.length);
          rules.push(rule);
        }
        return [Math.floor(value / stride), ids.get(key)];
      });
    })
  );
  const nextStride = 2 ** Math.ceil(Math.log2(Math.max(rules.length, 1)));
  const states = representatives.map((state, index) => {
    const result = state.slice();
    for (const [stream, offset] of [1, 3, 5].entries()) {
      if (!state[offset]) continue;
      result[offset] = transitions[index][stream].map((value, i) => {
        if (!(i % 2)) return value;
        const packed = value[0] * nextStride + value[1];
        if (packed > 0x7fffffff) throw new Error('Transition priority exceeds packed integer limit');
        return packed;
      });
    }
    return result;
  });
  return {
    ...machine,
    states,
    rules,
    ruleMask: nextStride - 1,
    ...(machine.firstState === undefined ? {} : { firstState: classes[machine.firstState] }),
    ...(machine.roots
      ? { roots: machine.roots.map(([root, first]) => [classes[root], first < 0 ? -1 : classes[first]]) }
      : {})
  };
}

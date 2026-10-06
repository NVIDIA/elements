// Offsets refer to the original source; replacement ranges must not overlap.
export function replaceTextRanges(source, replacements) {
  // Replace ranges in reverse order so each edit only shifts previously processed content.
  for (const { start, end, value } of replacements.toSorted((a, b) => b.start - a.start)) {
    source = source.slice(0, start) + value + source.slice(end);
  }
  return source;
}

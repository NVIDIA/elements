/** formats a file size in bytes to a human readable string */
export function formatFileSize(size: number): string {
  const thresholds = new Map<number, string>([
    [1024 ** 4, 'TB'],
    [1024 ** 3, 'GB'],
    [1024 ** 2, 'MB'],
    [1024 ** 1, 'KB'],
    [1, 'B']
  ]);
  for (const [threshold, unit] of thresholds.entries()) {
    if (size >= threshold) {
      return `${(size / threshold).toFixed(2)} ${unit}`;
    }
  }
  return `0`;
}

/** removes leading white space for a multiline string */
export function shiftLeft(value: string) {
  const shift = value.replace(/^\n|\n$/g, '').search(/\S|$/);
  return value
    .trim()
    .split('\n')
    .map(line => {
      return line
        .split('')
        .filter((c, i) => i >= shift || c !== ' ')
        .join('');
    })
    .join('\n');
}

export let DOCS_URL = '';
/* @ts-expect-error -- VITE_BUNDLE_CONFIG is only defined at build time */
if (!import.meta.env.VITE_BUNDLE_CONFIG) {
  DOCS_URL = 'http://nv/elements';
}

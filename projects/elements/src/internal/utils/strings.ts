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

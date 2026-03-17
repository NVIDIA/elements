export function markdown() {
  return {
    name: 'markdown-loader',
    transform(code, id) {
      if (id.split('?')[0].endsWith('.md')) {
        // For .md files, get the raw content as a string
        return `export default ${JSON.stringify(code)};`;
      }
    }
  };
}

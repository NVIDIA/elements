declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.css?inline' {
  const content: string;
  export = content;
}

declare module 'markdown-it' {
  interface MarkdownIt {
    render(markdown: string): string;
  }
  interface MarkdownItConstructor {
    new (config?: Record<string, unknown>): MarkdownIt;
  }
  const MarkdownIt: MarkdownItConstructor;
  export default MarkdownIt;
}

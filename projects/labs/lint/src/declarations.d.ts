declare module '*.json?inline' {
  const content: { [key: string]: unknown };
  export = content;
}

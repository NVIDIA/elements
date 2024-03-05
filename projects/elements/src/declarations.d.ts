declare module '*.css?inline' {
  const content: string;
  export = content;
}

declare module '*.svg?raw' {
  const content: string;
  export = content;
}

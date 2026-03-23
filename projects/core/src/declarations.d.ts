declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.css?inline' {
  const content: string;
  export = content;
}

declare module '*.svg?raw' {
  const content: string;
  export = content;
}

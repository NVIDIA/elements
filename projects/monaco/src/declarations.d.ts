declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.css?inline' {
  const content: string;
  export = content;
}

declare module '*.worker.js?worker&inline' {
  const content: { new (): Worker };
  export = content;
}

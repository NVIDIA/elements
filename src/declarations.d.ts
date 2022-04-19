declare module '*.css';
declare module '*.css?inline';

interface CSSStyleSheet {
  replace(text: string): Promise<CSSStyleSheet>;
}

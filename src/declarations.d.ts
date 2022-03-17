declare module '*.css';

interface CSSStyleSheet {
  replace(text: string): Promise<CSSStyleSheet>;
}

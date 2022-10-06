declare module '*.css';
declare module '*.css?inline';

interface ElementInternals {
  role: string;
  states: {
    add: (state: string) => void;
    delete: (state: string) => void;
  }
}

interface HTMLInputElement {
  showPicker: () => void;
}

interface HTMLElement {
  'mlv-text': string;
  'mlv-layout': string;
}

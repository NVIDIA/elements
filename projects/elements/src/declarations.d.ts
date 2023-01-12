declare module '*.css';
declare module '*.css?inline';

interface Window {
  MLV_ELEMENTS: {
    state: {
      versions: string[];
      elementRegistry: Readonly<{ [key: string]: string }>;
      i18nRegistry: Readonly<{ [key: string]: string }>;
      iconRegistry: Readonly<{ [key: string]: any }>;
    },
    debug: () => void;
  }
}

interface ElementInternals {
  states: {
    add: (state: string) => void;
    delete: (state: string) => void;
  }
}

interface HTMLElement {
  'mlv-text': string;
  'mlv-layout': string;
}

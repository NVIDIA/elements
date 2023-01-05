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

interface HTMLDialogElement extends HTMLElement {
  show?: () => void;
  showModal?: () => void;
  close?: (returnValue?: string) => void;
  returnValue?: string;
  open?: boolean;
}
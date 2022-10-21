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
  'nve-text': string;
  'nve-layout': string;
}

interface HTMLDialogElement extends HTMLElement {
  show?: () => void;
  showModal?: () => void;
  close?: (returnValue?: string) => void;
  returnValue?: string;
}
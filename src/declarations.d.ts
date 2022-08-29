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

interface HTMLElementTagNameMap {
  'mlv-button': Button;
  'mlv-card': Card;
  'mlv-card-header': CardHeader;
  'mlv-card-footer': CardFooter;
  'mlv-icon': Icon;
}

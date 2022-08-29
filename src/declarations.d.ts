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
  'nve-button': Button;
  'nve-card': Card;
  'nve-card-header': CardHeader;
  'nve-card-footer': CardFooter;
  'nve-icon': Icon;
}

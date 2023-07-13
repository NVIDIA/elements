declare module '*.css?inline' {
  const content: string;
  export = content;
}

declare module '*.svg?raw' {
  const content: string;
  export = content;
}

interface ElementInternals extends ARIAMixin {
  readonly form: HTMLFormElement | null;
  readonly labels: NodeList;
  readonly shadowRoot: ShadowRoot | null;
  readonly validationMessage: string;
  readonly validity: ValidityState;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setFormValue(value: File | string | FormData | null, state?: File | string | FormData | null): void;
  setValidity(flags?: ValidityStateFlags, message?: string, anchor?: HTMLElement): void;
  role: string;
  states: {
    has: (state: string) => boolean;
    add: (state: string) => void;
    delete: (state: string) => void;
  }
}

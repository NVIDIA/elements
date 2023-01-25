
export type Interaction = 'emphasize' | 'destructive';

export type GhostInteraction = 'ghost' | `${'ghost'}-${Interaction}`;

export type Inverse = 'inverse';

export type InlinePosition = 'start' | 'center' | 'end';

export type BlockPosition = 'start' | 'center' | 'end';

export type Position = 'center' | `block-${BlockPosition}` | `inline-${InlinePosition}`;

export type Status = 'accent' | 'warning' | 'success' | 'danger';

export const statusIcons = {
  default: 'information',
  accent: 'information',
  warning: 'warning',
  success: 'passed-or-success',
  danger: 'warning'
};

declare global {
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
    'nve-text': string;
    'nve-layout': string;
  }
}

import type { IconName } from "@elements/elements/icon";

export type Interaction = 'emphasize' | 'destructive';

/** @deprecated */
export type GhostInteraction = 'ghost' | `${'ghost'}-${Interaction}`;

export type FlatInteraction = 'flat' | `${'flat'}-${Interaction}`;

export type Inverse = 'inverse';

export type InlinePosition = 'start' | 'center' | 'end';

export type BlockPosition = 'start' | 'center' | 'end';

export type Position = 'center' | `block-${BlockPosition}` | `inline-${InlinePosition}`;

export type SupportStatus = 'accent' | 'warning' | 'success' | 'danger';

export type TaskStatus = 'scheduled' | 'queued' | 'pending' | 'starting' | 'running' | 'restarting' | 'stopping' | 'finished' | 'failed' | 'unknown';

export type TrendStatus = 'trend-down' | 'trend-up' | 'trend-neutral';

export type ColorPalette = 'red-cardinal' | 'gray-slate' | 'gray-denim' | 'blue-indigo' | 'blue-cobalt' | 'blue-sky' | 'teal-cyan' | 'green-mint' | 'teal-seafoam' | 'green-grass' | 'yellow-amber' | 'orange-pumpkin' | 'red-tomato' | 'pink-magenta' | 'purple-plum' | 'purple-violet' | 'purple-lavender' | 'pink-rose' | 'green-jade' | 'lime-pear' | 'yellow-nova' | 'brand-green';

export interface Container {
  container?: 'flat' | 'full' | 'inset';
}

export const statusIcons: { [key: string]: IconName } = {
  '': 'information',
  undefined: 'information',
  default: 'information',
  accent: 'information',
  warning: 'warning',
  success: 'success-badge',
  danger: 'important-badge',
  scheduled: 'schedule',
  failed: 'failed-badge',
  finished: 'success-badge',
  unknown: 'help',
  queued: 'checklist',
  running: 'dot',
  restarting: 'dot',
  stopping: 'dot',
  pending: 'dot',
  starting: 'dot',
  'trend-up': 'trend-up',
  'trend-down': 'trend-down',
  'trend-neutral': 'minus'
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

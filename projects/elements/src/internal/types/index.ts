import type { IconName } from "@elements/elements/icon";

export type Interaction = 'emphasize' | 'destructive';

export type FlatInteraction = 'flat' | `${'flat'}-${Interaction}`;

export type Inverse = 'inverse';

export type InlinePosition = 'start' | 'center' | 'end';

export type BlockPosition = 'start' | 'center' | 'end';

export type Position = 'center' | `block-${BlockPosition}` | `inline-${InlinePosition}`;

export type SupportStatus = 'accent' | 'warning' | 'success' | 'danger';

export type TaskStatus = 'scheduled' | 'queued' | 'pending' | 'starting' | 'running' | 'restarting' | 'stopping' | 'finished' | 'failed' | 'unknown' | 'ignored';

export type TrendStatus = 'trend-down' | 'trend-up' | 'trend-neutral';

export type ColorPalette = 'red-cardinal' | 'gray-slate' | 'gray-denim' | 'blue-indigo' | 'blue-cobalt' | 'blue-sky' | 'teal-cyan' | 'green-mint' | 'teal-seafoam' | 'green-grass' | 'yellow-amber' | 'orange-pumpkin' | 'red-tomato' | 'pink-magenta' | 'purple-plum' | 'purple-violet' | 'purple-lavender' | 'pink-rose' | 'green-jade' | 'lime-pear' | 'yellow-nova' | 'brand-green';

export type Size = 'sm' | 'md' | 'lg';

export type Container = 'flat' | 'full' | 'inset';

export interface ContainerElement {
  container?: Partial<Container>;
}

export const statusIcons: { [key: string]: IconName } = {
  '': 'information-circle-stroke',
  undefined: 'information-circle-stroke',
  default: 'information-circle-stroke',
  accent: 'information-circle-stroke',
  warning: 'exclamation-triangle',
  success: 'checkmark-circle',
  danger: 'exclamation-circle',
  scheduled: 'clock',
  failed: 'x-circle',
  finished: 'checkmark-circle',
  unknown: 'question-mark-circle',
  queued: 'bar-pill-stack',
  running: 'running',
  restarting: 'refresh',
  stopping: 'stop-sign',
  pending: 'circle-dash',
  starting: 'circle-dot',
  'trend-up': 'trend-up',
  'trend-down': 'trend-down',
  'trend-neutral': 'minus',
  ignored: 'circle-angled-line'
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
      debug: (log?: (...args) => void) => void;
    }
  }

  interface ElementInternals {
    states: {
      add: (state: string) => void;
      delete: (state: string) => void;
      has: (state: string) => boolean;
    }
  }

  interface HTMLElement {
    'mlv-text': string;
    'mlv-layout': string;
  }
}

/** @deprecated */
export type GhostInteraction = 'ghost' | `${'ghost'}-${Interaction}`;

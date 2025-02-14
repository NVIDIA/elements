import type { IconName } from '@nvidia-elements/core/icon';
import type { I18nStrings } from '../services/i18n.service.js';

export type Color =
  | 'red-cardinal'
  | 'gray-slate'
  | 'gray-denim'
  | 'blue-indigo'
  | 'blue-cobalt'
  | 'blue-sky'
  | 'teal-cyan'
  | 'green-mint'
  | 'teal-seafoam'
  | 'green-grass'
  | 'yellow-amber'
  | 'orange-pumpkin'
  | 'red-tomato'
  | 'pink-magenta'
  | 'purple-plum'
  | 'purple-violet'
  | 'purple-lavender'
  | 'pink-rose'
  | 'green-jade'
  | 'lime-pear'
  | 'yellow-nova'
  | 'brand-green';

/** Determines relative size of the element */
export type Size = 'sm' | 'md' | 'lg';

/** Determines relative size of the element */
export type SizeExpanded = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Determines the visual prominence or weight of an element. */
export type Prominence = 'emphasis' | 'muted';

/**
 * Determines the container bounds of the element
 * - `flat` element has white space bounds but reduced visual container
 * - `inline` element container is reduced to fit within inline content such as a block of text
 * - `inset` element container is optimized for embeding or being inset inside another containing element
 * - `full` element container is optimized for filling its container bounds
 * - `condensed` element container is optimized for small, summarized or contained spaces
 */
export type Container = 'inline' | 'flat' | 'inset' | 'full' | 'condensed';

/** Determines the support status color of an element. Should convey intent of the element. */
export type SupportStatus = 'accent' | 'warning' | 'success' | 'danger';

/** Determines the orientation of an element. */
export type Orientation = 'vertical' | 'horizontal';

/** Determines the task status of an element. Should convey the active state of a process. */
export type TaskStatus =
  | 'scheduled'
  | 'queued'
  | 'pending'
  | 'starting'
  | 'running'
  | 'restarting'
  | 'stopping'
  | 'finished'
  | 'failed'
  | 'unknown'
  | 'ignored';

/**
 * https://open-ui.org/components/popup.research.explainer#api-shape
 * - `auto` light dismiss, focus on open, return to trigger
 * - `manual` no light dismiss, no auto focus
 * - `hint` no light dismiss, no auto focus, open/close on hover/focus
 */
export type PopoverType = 'auto' | 'manual' | 'hint' | 'inline';

/** Determines the popover alignment relative to its assigned anchor */
export type PopoverAlign = 'start' | 'end' | 'center';

/** Determines the popover position relative to its assigned anchor and alignment */
export type PopoverSides = 'top' | 'bottom' | 'left' | 'right';

/** Determines the popover position relative to its assigned anchor */
export type PopoverPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

/** Determines the overall position of an element relative to its anchor */
export type Placement = PopoverPosition | `${PopoverSides}-${PopoverAlign}`;

/** Determines the overal control layout relative to the control input and labels */
export type ControlLayout = 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

export interface NveElement {
  /** Determines if an element is disabled. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled */
  disabled?: boolean;

  /** Determines if an element is active via user interaction, keydown, mousedown and touch. https://developer.mozilla.org/en-US/docs/Web/CSS/:active */
  active?: boolean;

  /** Determines if an element is expanded, typically following a disclosure pattern. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded */
  expanded?: boolean;

  /** Determines if an element is pressed as a stand alone interaction. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed */
  pressed?: boolean;

  /** Deterimines if an element is selected and part of a multi choice selection group. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected */
  selected?: boolean;

  /** Sets a interactive element to be in a readonly content state. https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly */
  readonly?: boolean;

  /** Defines the value associated with the elmeents's name when it's submitted with the form data. This value is passed to the server in params when the form is submitted using this button. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#value */
  value?: string;

  /** The name of the element, submitted as a pair with the element value as part of the form data. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-name */
  name?: string;

  /** Determines if the element can be closed by the user. */
  closable?: boolean;

  /** Enables internal string values to be updated for internationalization. */
  i18n?: Partial<I18nStrings & { __set: boolean }>;

  /** This Boolean attribute sets the current state, used to represent the current page or navigation link. https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current */
  current?: 'page' | 'step';

  /** Determines the position of an element along the inline axis. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Box_alignment_in_grid_layout#the_two_axes_of_a_grid_layout */
  inlinePosition?: 'start' | 'center' | 'end';

  /** Determines the position of an element along the block axis. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Box_alignment_in_grid_layout#the_two_axes_of_a_grid_layout */
  blockPosition?: 'start' | 'center' | 'end';

  /** Determines the overall layout of the element. */
  layout?: 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

  /** Determines the orientation of an element. */
  orientation?: 'vertical' | 'horizontal';

  /** Determines the visual prominence or weight of an element */
  prominence?: 'emphasis' | 'muted';

  /** Provides a way to indicate the intended use case for a button or similar interactive element. This can help users quickly understand what each interaction will do and reduce the potential for confusion or errors. */
  interaction?: 'emphasis' | 'destructive';

  /** Defines a base color from the theme color palette */
  color?:
    | 'red-cardinal'
    | 'gray-slate'
    | 'gray-denim'
    | 'blue-indigo'
    | 'blue-cobalt'
    | 'blue-sky'
    | 'teal-cyan'
    | 'green-mint'
    | 'teal-seafoam'
    | 'green-grass'
    | 'yellow-amber'
    | 'orange-pumpkin'
    | 'red-tomato'
    | 'pink-magenta'
    | 'purple-plum'
    | 'purple-violet'
    | 'purple-lavender'
    | 'pink-rose'
    | 'green-jade'
    | 'lime-pear'
    | 'yellow-nova'
    | 'brand-green';

  /** Defines the visual treatment to represent a interaction status. (tasks, support, trends) */
  status?: 'accent' | 'warning' | 'success' | 'danger';

  /** Determines the size options of a given element */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Determines the container bounds of the element
   * - `flat` element has white space bounds but reduced visual container
   * - `inline` element container is reduced to fit within inline content such as a block of text
   * - `inset` element container is optimized for embeding or being inset inside another containing element
   * - `full` element container is optimized for filling its container bounds
   */
  container?: 'inline' | 'flat' | 'inset' | 'full';

  /** Determines the position of an element along both inline and block axis. https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Box_alignment_in_grid_layout#the_two_axes_of_a_grid_layout */
  position?:
    | 'top-start'
    | 'top-end'
    | 'top-center'
    | 'bottom-start'
    | 'bottom-end'
    | 'bottom-center'
    | 'left-start'
    | 'left-end'
    | 'left-center'
    | 'right-start'
    | 'right-end'
    | 'right-center';

  /** Determines the alignment of the popover relative to the provided anchor element. */
  alignment?: 'start' | 'end' | 'center';

  /** Provides the element that the popover should position relative to. Anchor can accept a idref string within the same render root or a HTMLElement DOM reference. */
  anchor?: string | HTMLElement;

  /** Defines what element triggers an `open` interaction event. A trigger can accept a idref string within the same render root or a HTMLElement DOM reference. */
  trigger?: string | HTMLElement;

  /** Defines what public Slot names are available to the element. */
  slots?: 'default' | 'prefix' | 'suffix' | 'header' | 'footer' | 'actions' | 'icon';

  /** @private A instance of `ElementInternals` that is set dynamically by the applied decorators/controllers */
  _internals: ElementInternals;

  render: any;
}

export type SlotName = 'default' | 'prefix' | 'suffix' | 'header' | 'footer' | 'actions' | 'icon';

/** @deprecated Determines the interaction type of a flat container element. */
export type FlatInteraction = 'flat' | 'flat-emphasize' | `${'flat'}-${Interaction}`;

/** @deprecated Determines if an element is rendered with an inverse contrast. */
export type Inverse = 'inverse';

/** @deprecated Determines the trend status of an element. Should convey the trend of a metric. */
export type TrendStatus = 'trend-down' | 'trend-up' | 'trend-neutral';

/** The Interaction type provides a way to indicate the intended use case for a button or other interactive element. This can help users quickly understand what each interaction will do and reduce the potential for confusion or errors. */
export type Interaction = 'emphasis' | 'destructive';

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
  var NVE_ELEMENTS: {
    state: {
      env: 'watch' | 'production' | 'development';
      versions: string[];
      elementRegistry: Readonly<{ [key: string]: string }>;
      i18nRegistry: Readonly<{ [key: string]: string }>;
      audit: Readonly<{
        [key: string]: {
          count?: number;
          excessiveInstanceLimitAudited?: boolean;
        };
      }>;
    };
    debug: (log?: (...args) => void) => void;
  };

  interface HTMLElement {
    'nve-text': string;
    'nve-layout': string;
  }
}

export interface Point {
  x: number;
  y: number;
}

export interface OffsetPoint {
  offsetX: number;
  offsetY: number;
}

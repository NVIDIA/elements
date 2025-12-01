import type { TemplateResult } from 'lit';
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

/** Controls the visual scale of an element to match its importance and available space.
 * - `sm` - Compact size for dense layouts or secondary elements with less visual prominence.
 * - `md` - Standard size that works well in most contexts and provides balanced visibility.
 * - `lg` - Larger size for emphasizing important elements or improving touch targets in spacious layouts.
 */
export type Size = 'sm' | 'md' | 'lg';

/** Controls the visual scale of an element to match its importance and available space.
 * - `xs` - Extra small size for very small elements or very dense layouts.
 * - `sm` - Compact size for dense layouts or secondary elements with less visual prominence.
 * - `md` - Standard size that works well in most contexts and provides balanced visibility.
 * - `lg` - Larger size for emphasizing important elements or improving touch targets in spacious layouts.
 * - `xl` - Extra extra large size for very large elements or very sparse layouts.
 */
export type SizeExpanded = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Controls the visual prominence to establish hierarchy and guide user attention.
 * - `emphasis` - Increases visual weight to draw attention and highlight important elements.
 * - `muted` - Reduces visual weight for supporting content that should remain subtle and unobtrusive.
 */
export type Prominence = 'emphasis' | 'muted';

/**
 * Determines the container bounds of the element
 * - `flat` Element has white space bounds but reduced visual container.
 * - `inline` Element container is reduced to fit within inline content such as a block of text.
 * - `inset` Element container is optimized for embedding or being inset inside another containing element.
 * - `full` Element container is optimized for filling its container bounds.
 * - `condensed` Element container is optimized for small, summarized or contained spaces.
 */
export type Container = 'inline' | 'flat' | 'inset' | 'full' | 'condensed';

/** Communicates the intent and semantic meaning of an element to help users understand the outcome of their actions.
 * - `accent` - Highlights important actions or draws attention to primary interactive elements.
 * - `warning` - Indicates cautionary actions that require careful consideration before proceeding.
 * - `success` - Represents positive outcomes, confirmations, or constructive actions.
 * - `danger` - Signals destructive or irreversible actions that need extra attention and confirmation.
 */
export type SupportStatus = 'accent' | 'warning' | 'success' | 'danger';

/** Determines the orientation of an element. */
export type Orientation = 'vertical' | 'horizontal';

/** Communicates the current state of a task or process to keep users informed of progress and outcomes.
 * - `scheduled` - Task has been scheduled for future execution at a specific time.
 * - `queued` - Task is waiting in line to begin after other tasks complete.
 * - `pending` - Task is awaiting approval, user input, or external conditions before proceeding.
 * - `starting` - Task is initializing and preparing to begin active execution.
 * - `running` - Task is actively executing and making progress.
 * - `restarting` - Task is being restarted after an interruption or reset.
 * - `stopping` - Task is gracefully shutting down and completing cleanup operations.
 * - `finished` - Task has completed successfully with the expected outcome.
 * - `failed` - Task encountered an error and did not complete as intended.
 * - `unknown` - Task status cannot be determined or is unavailable.
 * - `ignored` - Task was intentionally skipped or excluded from execution.
 */
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

/** Controls how the popover aligns along the edge of its anchor element.
 * - `start` - Aligns the popover to the beginning edge of the anchor for left or top alignment.
 * - `end` - Aligns the popover to the ending edge of the anchor for right or bottom alignment.
 * - `center` - Centers the popover along the anchor's edge for balanced positioning.
 */
export type PopoverAlign = 'start' | 'end' | 'center';

/** Determines the popover position relative to its assigned anchor and alignment.
 * - `top` - Positions the popover above the anchor element.
 * - `bottom` - Positions the popover below the anchor element.
 * - `left` - Positions the popover to the left side of the anchor element.
 * - `right` - Positions the popover to the right side of the anchor element.
 */
export type PopoverSides = 'top' | 'bottom' | 'left' | 'right';

/** Controls the placement of the popover relative to its anchor element.
 * - `center` - Centers the popover directly over the anchor element.
 * - `top` - Positions the popover above the anchor element.
 * - `bottom` - Positions the popover below the anchor element.
 * - `left` - Positions the popover to the left side of the anchor element.
 * - `right` - Positions the popover to the right side of the anchor element.
 */
export type PopoverPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

/** Determines the overall position of an element relative to its anchor */
export type Placement = PopoverPosition | `${PopoverSides}-${PopoverAlign}`;

/** Controls the directional arrangement and spacing behavior of the element's content.
 * - `vertical` - Arranges content in a vertical stack with block-level spacing.
 * - `vertical-inline` - Arranges content vertically with compact inline spacing for dense layouts.
 * - `horizontal` - Arranges content in a horizontal row with block-level spacing.
 * - `horizontal-inline` - Arranges content horizontally with compact inline spacing.
 */
export type ControlLayout = 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

export interface NveElement {
  /**
   * This Boolean attribute prevents the user from interacting with the element: it cannot be pressed or focused. [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled)
   * - `true` - The element is disabled and cannot be interacted with.
   * - `false` - The element is enabled and can be interacted with.
   */
  disabled?: boolean;

  /** Indicates whether the element is currently being actively engaged through user interaction. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:active)
   * - `true` - Element is being pressed or activated by the user (mousedown, keydown, or touch).
   * - `false` - Element is not currently being actively engaged by the user.
   */
  active?: boolean;

  /** Indicates whether collapsible content is currently visible or hidden from the user. [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded)
   * - `true` - The associated content is expanded and visible to the user.
   * - `false` - The associated content is collapsed and hidden from the user.
   */
  expanded?: boolean;

  /** Indicates the current state of a toggle button that can be switched on or off. [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed)
   * - `true` - The button is in the pressed (on) state and the associated action or setting is active.
   * - `false` - The button is in the unpressed (off) state and the associated action or setting is inactive.
   */
  pressed?: boolean;

  /** Indicates whether an element is currently chosen within a multi-option selection group. [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected)
   * - `true` - The element is selected and represents the user's current choice within the group.
   * - `false` - The element is not selected and is available to be chosen by the user.
   */
  selected?: boolean;

  /** Indicates whether the element's value can be modified by the user while remaining visible and focusable. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly)
   * - `true` - The element is readonly and its value cannot be changed, but can still be focused and copied.
   * - `false` - The element is editable and the user can modify its value through interaction.
   */
  readonly?: boolean;

  /** Defines the value associated with the element's name when it's submitted with the form data. This value is passed to the server in params when the form is submitted using this button. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#value) */
  value?: string;

  /** The name of the element, submitted as a pair with the element value as part of the form data. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-name) */
  name?: string;

  /** Indicates whether the element can be dismissed or closed by the user.
   * - `true` - The element displays a close control and can be dismissed by the user.
   * - `false` - The element cannot be closed by the user and requires programmatic dismissal.
   */
  closable?: boolean;

  /** Enables internal string values to be updated for internationalization. */
  i18n?: Partial<I18nStrings & { __set: boolean }>;

  /** Indicates the element that represents the user's current location or position within a set. [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current)
   * - `page` - Marks the current page within a set of navigation links.
   * - `step` - Marks the current step within a multi-step process or workflow.
   */
  current?: 'page' | 'step';

  /** Controls the horizontal alignment of the element within its container, respecting the text direction. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Box_alignment_in_grid_layout#the_two_axes_of_a_grid_layout)
   * - `start` - Aligns the element to the beginning of the inline axis (left in LTR, right in RTL).
   * - `center` - Centers the element along the inline axis for balanced visual positioning.
   * - `end` - Aligns the element to the end of the inline axis (right in LTR, left in RTL).
   */
  inlinePosition?: 'start' | 'center' | 'end';

  /** Controls the vertical alignment of the element within its container. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Box_alignment_in_grid_layout#the_two_axes_of_a_grid_layout)
   * - `start` - Aligns the element to the top of the block axis for top-aligned positioning.
   * - `center` - Centers the element along the block axis for balanced vertical positioning.
   * - `end` - Aligns the element to the bottom of the block axis for bottom-aligned positioning.
   */
  blockPosition?: 'start' | 'center' | 'end';

  /** Controls the directional arrangement and spacing behavior of the element's content.
   * - `vertical` - Arranges content in a vertical stack with block-level spacing.
   * - `vertical-inline` - Arranges content vertically with compact inline spacing for dense layouts.
   * - `horizontal` - Arranges content in a horizontal row with block-level spacing.
   * - `horizontal-inline` - Arranges content horizontally with compact inline spacing.
   */
  layout?: 'vertical' | 'vertical-inline' | 'horizontal' | 'horizontal-inline';

  /** Controls the directional flow of the element's layout and interaction pattern.
   * - `vertical` - Element is oriented vertically with top-to-bottom flow.
   * - `horizontal` - Element is oriented horizontally with left-to-right flow.
   */
  orientation?: 'vertical' | 'horizontal';

  /** Controls the visual prominence to establish hierarchy and guide user attention.
   * - `emphasis` - Increases visual weight to draw attention and highlight important elements.
   * - `muted` - Reduces visual weight for supporting content that should remain subtle and unobtrusive.
   */
  prominence?: 'emphasis' | 'muted';

  /** The Interaction type provides a way to indicate the intent of an interactive element. This can help users quickly understand what each interaction will do and reduce the potential for confusion or errors.
   * - `emphasis` Indicates the interaction is intended to be used for emphasis or highlighting primary actions.
   * - `destructive` Indicates the interaction is intended to be used for destructive actions such as deleting or removing.
   */
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

  /** Communicates the intent and semantic meaning of an element to help users understand the outcome of their actions.
   * - `accent` - Highlights important actions or draws attention to primary interactive elements.
   * - `warning` - Indicates cautionary actions that require careful consideration before proceeding.
   * - `success` - Represents positive outcomes, confirmations, or constructive actions.
   * - `danger` - Signals destructive or irreversible actions that need extra attention and confirmation.
   */
  status?: 'accent' | 'warning' | 'success' | 'danger';

  /** Controls the visual scale of an element to match its importance and available space.
   * - `sm` - Compact size for dense layouts or secondary elements with less visual prominence.
   * - `md` - Standard size that works well in most contexts and provides balanced visibility.
   * - `lg` - Larger size for emphasizing important elements or improving touch targets in spacious layouts.
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Demonstrates different container styles to accommodate various visual weight and context.
   * - `flat` Element has white space bounds but reduced visual container.
   * - `inline` Element container is reduced to fit within inline content such as a block of text.
   * - `inset` Element container is optimized for embedding or being inset inside another containing element.
   * - `full` Element container is optimized for filling its container bounds.
   */
  container?: 'inline' | 'flat' | 'inset' | 'full';

  /** Determines the position of an element along both inline and block axis. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Box_alignment_in_grid_layout#the_two_axes_of_a_grid_layout) */
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

  /** Defines named content areas where users can insert custom markup into the element.
   * - `default` - The primary content area for the element.
   * - `prefix` - Content that appears before the main element content.
   * - `suffix` - Content that appears after the main element content.
   * - `header` - Content that appears at the top of the element, used for titles or introductory information.
   * - `footer` - Content that appears at the bottom of the element, used for supplementary information or actions.
   * - `actions` - Content area specifically for interactive controls like buttons or links.
   * - `icon` - Content area for displaying an icon that represents the element's purpose or state.
   */
  slots?: 'default' | 'prefix' | 'suffix' | 'header' | 'footer' | 'actions' | 'icon';

  /**
   * Sets the automatic dismissal time in milliseconds before the element emits a `close` event. Allow ~200-250ms per word for comfortable reading.
   * - `0` - Warning or error messages requiring immediate acknowledgment.
   * - `3000` - Brief success or confirmation messages.
   * - `7000` - Standard informational messages.
   * - `10000` - Messages with actions or requiring user decision.
   */
  closeTimeout?: number;

  /**
   * Sets the delay in milliseconds before the element emits a `open` event.
   * - `0` - Keyboard focus interactions (always immediate for accessibility).
   * - `500` - Dense interfaces with many tooltips to reduce visual noise and prevent accidental triggers.
   */
  openDelay?: number;

  /** @private A instance of `ElementInternals` that is set dynamically by the applied decorators/controllers */
  _internals: ElementInternals;

  render: TemplateResult;
}

/** Defines named content areas where users can insert custom markup into the element.
 * - `default` - The primary content area for the element.
 * - `prefix` - Content that appears before the main element content.
 * - `suffix` - Content that appears after the main element content.
 * - `header` - Content that appears at the top of the element, used for titles or introductory information.
 * - `footer` - Content that appears at the bottom of the element, used for supplementary information or actions.
 * - `actions` - Content area specifically for interactive controls like buttons or links.
 * - `icon` - Content area for displaying an icon that represents the element's purpose or state.
 */
export type SlotName = 'default' | 'prefix' | 'suffix' | 'header' | 'footer' | 'actions' | 'icon';

/** @deprecated Determines the interaction type of a flat container element. */
export type FlatInteraction = 'flat' | 'flat-emphasize' | `${'flat'}-${Interaction}`;

/** @deprecated Determines if an element is rendered with an inverse contrast. */
export type Inverse = 'inverse';

/** @deprecated Determines the trend status of an element. Should convey the trend of a metric. */
export type TrendStatus = 'trend-down' | 'trend-up' | 'trend-neutral';

/** The Interaction type provides a way to indicate the intent of an interactive element. This can help users quickly understand what each interaction will do and reduce the potential for confusion or errors.
 * - `emphasis` Indicates the interaction is intended to be used for emphasis or highlighting primary actions.
 * - `destructive` Indicates the interaction is intended to be used for destructive actions such as deleting or removing.
 */
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
      pageHost: string;
      moduleHost: string;
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

/** https://github.com/tc39/proposal-decorators */
export type LegacyDecoratorTarget = Function & {
  addInitializer?: (initializer: (instance: any) => void) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
};

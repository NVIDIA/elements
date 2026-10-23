// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { styleMap } from 'lit/directives/style-map.js';
import { FormControlMixin } from '@nvidia-elements/forms/mixins';
import {
  GestureController,
  useStyles,
  type Gesture,
  type GestureInput,
  type Size
} from '@nvidia-elements/core/internal';
import { I18nController, type I18nDefaults } from '@nvidia-elements/foundations/internal/i18n';
import styles from './joystick.css?inline';

export interface JoystickValue {
  readonly x: number;
  readonly y: number;
}

export type JoystickConstraint = 'circle' | 'square' | 'horizontal' | 'vertical';
export type JoystickRelease = 'center' | 'hold';

export interface JoystickInteractionStart {
  readonly source: 'pointer' | 'keyboard';
}

export interface JoystickInteractionEnd extends JoystickInteractionStart {
  readonly reason:
    | 'release'
    | 'escape'
    | 'pointer-cancel'
    | 'lost-capture'
    | 'blur'
    | 'hidden'
    | 'disabled'
    | 'readonly'
    | 'configuration-change'
    | 'reset'
    | 'disconnect';
}

type Session = JoystickInteractionStart & { pointerId?: number; changed: boolean };

const i18nDefaults = {
  joystickPosition: 'X {x}, Y {y}.',
  joystickNoPosition: 'No position.',
  joystickInstructions:
    'Use arrow keys to adjust the enabled axes. Release to return to center. Press Escape to cancel.',
  joystickHoldInstructions:
    'Use arrow keys to adjust the enabled axes. Release to keep the position. Escape and interruptions return to center.',
  joystickReturnedToCenter: '{position} Returned to center.'
} satisfies I18nDefaults;

const directions: Record<string, JoystickValue> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }
};

/* eslint-disable jsdoc/no-types -- The metadata analyzer needs the inherited generic value type. */
/**
 * @element nve-joystick
 * @description A joystick selects a normalized two-axis vector with pointer or keyboard input.
 * Applications own physical units, coordinate frames, input shaping, publishing cadence, recording clocks,
 * command-outcome feedback, and alternative controls when needed.
 *
 * Give each joystick an accessible name with a label, aria-label, or aria-labelledby.
 * Editable controls use the application role to receive two-axis keyboard input.
 * The default accessible description includes both normalized coordinates, keyboard instructions, and release behavior.
 * A locked axis stays at zero; an absent value reads "No position." Disabled and read-only controls omit instructions.
 * Coordinates use up to six decimal places and the document language for number formatting.
 * An explicit aria-description or aria-describedby replaces the default focus description through standard ARIA precedence;
 * it does not disable live announcements.
 * @documentation https://nvidia.github.io/elements/docs/elements/joystick/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/joystick
 * @property {JoystickValue | undefined} value - The normalized vector: positive x points right and positive y points down, independent of text direction. Assign a complete finite object within the selected constraint. Invalid vectors throw TypeError without replacing the previous value. Programmatic writes do not dispatch input or change events. Use undefined for an absent sample and a zero vector for recorded neutral input. Set readOnly before assigning replay ownership. User input can replace external writes during an interaction.
 * @attribute {string} value - A JSON object containing normalized x and y coordinates.
 * @event input - Dispatched after user input changes the vector, including a return to neutral. Read .value for the current vector. A held position does not generate repeated events. Publish commands at an application-controlled cadence.
 * @event change - Dispatched after a normal interaction completes and produces input. Cancellation sends any necessary neutral input without change.
 * @event interaction-start - Dispatched with the pointer or keyboard source after setting :state(active), including engagement at neutral.
 * @event interaction-end - Dispatched with the source and terminal reason after clearing :state(active). Interruption first sends any necessary neutral input. Reset restores the declared default without value events. Detached events cannot bubble to former ancestors.
 * @cssprop --width
 * @cssprop --height
 * @cssprop --background
 * @cssprop --opacity - Background opacity when the opacity flag is present. Defaults to 0.6. The border, crosshair, thumb, and focus indicator keep their opacity.
 * @cssprop --border
 * @cssprop --thumb-width
 * @cssprop --thumb-height
 * @cssprop --thumb-background
 * @cssprop --thumb-border
 * @stable false
 */
export class Joystick extends FormControlMixin<typeof LitElement, JoystickValue>(LitElement) {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-joystick',
    version: '0.0.0',
    valueSchema: {
      type: 'object' as const,
      properties: {
        x: { type: 'number' as const, minimum: -1, maximum: 1 },
        y: { type: 'number' as const, minimum: -1, maximum: 1 }
      },
      required: ['x', 'y'],
      additionalProperties: false
    }
  };

  /**
   * Constrains the movement region or selects one axis. Circle limits vector magnitude to one;
   * square permits both axes at full scale and a magnitude of up to Math.SQRT2.
   * With equally scaled planar velocity axes, square corners allow about 41% greater speed.
   * Mixed forward-velocity and turning-rate axes have no common physical magnitude.
   * Changing the constraint projects the current value silently and cancels an active interaction.
   */
  @property({ type: String, reflect: true }) constraint: JoystickConstraint = 'circle';

  /** Sets surface and thumb size. At the default font size, sm is 104px, md is 130px, and lg is 156px. */
  @property({ type: String, reflect: true }) size: Size = 'md';

  /** Enables background transparency using the --opacity CSS custom property. */
  @property({ type: Boolean, reflect: true }) opacity = false;

  /**
   * Determines whether normal release returns to center or holds the final vector.
   * Interrupted interactions return to neutral in either mode. Form reset restores the declared default instead.
   */
  @property({ type: String, reflect: true }) release: JoystickRelease = 'center';

  /**
   * Sets the normalized increment for each arrow key press. Repeated presses continue adjusting;
   * releasing the final arrow applies the release behavior. Escape cancels the interaction.
   * Invalid steps fall back to 0.1. Modifier shortcuts and locked-axis directions remain available to the browser.
   */
  @property({ type: Number, attribute: 'keyboard-step' }) keyboardStep = 0.1;

  /**
   * Controls automatic position announcements. Focused user input produces polite announcements at most every 500 ms.
   * A quick tap in center mode reports the input coordinates and the return to center.
   * Escape announces the resulting coordinates without a separate cancellation message.
   * Programmatic writes and read-only playback update the description without live announcements.
   * Set off when the application supplies spoken output, the position description on focus remains available.
   */
  @property({ type: String }) announce: 'polite' | 'off' = 'polite';

  readonly #i18nController: I18nController<this> = new I18nController(this, i18nDefaults);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  #announcement = '';
  #pendingFeedback?: { value: JoystickValue; kind: 'position' | 'return' };
  #announcementTimer?: ReturnType<typeof setTimeout>;
  #lastInput?: JoystickValue;
  #writingInput = false;

  readonly #gestureController = new GestureController(this, {
    touchAction: () => (this.disabled || this.readOnly ? undefined : 'none'),
    suppressNativeDrag: true
  });
  readonly #keys = new Set<string>();
  #session?: Session;
  #resetting = false;
  #ownsTabIndex = false;

  static override get observedAttributes() {
    return [...super.observedAttributes, 'tabindex'];
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'tabindex') this.#ownsTabIndex = false;
  }

  override get disabled(): boolean {
    return super.disabled;
  }

  override set disabled(value: boolean | unknown) {
    super.disabled = Boolean(value);
    this.#checkAvailability();
  }

  override get readOnly(): boolean {
    return super.readOnly;
  }

  override set readOnly(value: boolean | unknown) {
    super.readOnly = Boolean(value);
    this.#checkAvailability();
  }

  constructor() {
    super();
    this.value = { x: 0, y: 0 };
  }

  connectedCallback() {
    const tabIndex = this.getAttribute('tabindex');
    const ownsTabIndex = this.#ownsTabIndex || tabIndex === null;
    super.connectedCallback();
    // The forms mixin assigns tabindex on connection; keep the caller's focus order.
    if (tabIndex !== null) this.setAttribute('tabindex', tabIndex);
    this.#ownsTabIndex = ownsTabIndex;
    if (this.hasUpdated) this.#gestureController.target = this;
    this.addEventListener('nve-gesture-input', this.#handleGestureInput);
    this.addEventListener('nve-gesture', this.#handleGesture);
    this.addEventListener('keydown', this.#handleKeyDown);
    this.addEventListener('keyup', this.#handleKeyUp);
    this.addEventListener('blur', this.#handleBlur);
    globalThis.window?.addEventListener('blur', this.#handleBlur);
    globalThis.document?.addEventListener('visibilitychange', this.#handleVisibility);
  }

  disconnectedCallback() {
    this.#end('disconnect');
    this.#clearFeedback();
    this.removeEventListener('nve-gesture-input', this.#handleGestureInput);
    this.removeEventListener('nve-gesture', this.#handleGesture);
    this.removeEventListener('keydown', this.#handleKeyDown);
    this.removeEventListener('keyup', this.#handleKeyUp);
    this.removeEventListener('blur', this.#handleBlur);
    globalThis.window?.removeEventListener('blur', this.#handleBlur);
    globalThis.document?.removeEventListener('visibilitychange', this.#handleVisibility);
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.#gestureController.target = this;
  }

  willUpdate(changes: PropertyValues<this>) {
    // Lit SSR converts reactive attributes without invoking the forms mixin callback.
    if (isServer && this.hasAttribute('value')) this._handleAttributeChange('value', this.getAttribute('value'));
    this.#checkAvailability();
    if (this.announce === 'off') this.#clearFeedback();
    if (changes.has('constraint') || changes.has('release') || changes.has('keyboardStep')) {
      this.#end('configuration-change');
      this.#clearFeedback();
      if (this.value) {
        const value = this.#constrain(this.value);
        if (!sameVector(this.value, value)) this.value = value;
      }
    }
  }

  updated() {
    if (this.#ownsTabIndex || !this.hasAttribute('tabindex')) {
      this.tabIndex = this.disabled ? -1 : 0;
      this.#ownsTabIndex = true;
    }
    // Editable joysticks own the two-axis keyboard interaction, including release and cancellation.
    this._internals.role = this.disabled || this.readOnly ? 'group' : 'application';
    this._internals.ariaLabel = this.ariaLabel || this.composedLabel || null;
    this._internals.ariaReadOnly = null;
    this._internals.ariaDescription = this.#description;
  }

  get #description() {
    const position = this.#describePosition(this.value);
    if (this.disabled || this.readOnly) return position;
    const instructions = this.release === 'hold' ? this.i18n.joystickHoldInstructions : this.i18n.joystickInstructions;
    return `${position} ${instructions}`;
  }

  render() {
    const value = this.value ?? { x: 0, y: 0 };
    return html`
      <div internal-host aria-hidden="true">
        <div class="background"></div>
        <div class="travel">
          <div class="thumb" ?hidden=${!this.value} style=${styleMap({ left: `${(value.x + 1) * 50}%`, top: `${(value.y + 1) * 50}%` })}></div>
        </div>
      </div>
      <span class="announcement" role="status" aria-live=${this.announce === 'off' ? 'off' : 'polite'} aria-atomic="true">${this.#announcement}</span>
    `;
  }

  override updateValue(value: JoystickValue) {
    // Only project the default assignment; writes from reset listeners still use strict validation.
    const nextValue = this.#resetting && isVector(value) ? this.#constrain(value) : value;
    this.#resetting = false;
    if (nextValue !== undefined && (!isVector(nextValue) || !sameVector(nextValue, this.#constrain(nextValue)))) {
      throw new TypeError('Joystick value must contain finite x and y coordinates within its constraint.');
    }
    super.updateValue(nextValue);
    if (!this.#writingInput) {
      this.#lastInput = undefined;
      this.#clearFeedback();
    }
  }

  override reset() {
    this.#end('reset');
    this.#clearFeedback();
    this.#resetting = true;
    try {
      super.reset();
    } finally {
      this.#resetting = false;
    }
  }

  override formStateRestoreCallback(state: unknown, _reason?: string) {
    if (typeof state !== 'string') return;
    let value: unknown;
    try {
      value = state === '' ? undefined : JSON.parse(state);
    } catch {
      return;
    }
    if (value !== undefined && (!isVector(value) || !sameVector(value, this.#constrain(value)))) return;
    this.#end('reset');
    this.value = value;
  }

  override _updateFormState() {
    if (!this.name || !this.value) {
      this._internals.setFormValue(null, this.valueAsString);
      return;
    }
    const data = new FormData();
    data.set(`${this.name}-x`, `${this.value.x}`);
    data.set(`${this.name}-y`, `${this.value.y}`);
    this._internals.setFormValue(data, this.valueAsString);
  }

  #constrain({ x, y }: JoystickValue): JoystickValue {
    const constraint = this.hasUpdated ? this.constraint : (this.getAttribute('constraint') ?? this.constraint);
    if (constraint === 'circle') {
      const length = Math.max(1, Math.hypot(x, y));
      return { x: x / length, y: y / length };
    }
    return {
      x: constraint === 'vertical' ? 0 : Math.max(-1, Math.min(1, x)),
      y: constraint === 'horizontal' ? 0 : Math.max(-1, Math.min(1, y))
    };
  }

  #begin(session: Session) {
    this.#session = session;
    this.#lastInput = undefined;
    // A later interaction can report identical text after an empty region.
    this.#announcement = '';
    this.requestUpdate();
    this._internals.states.add('active');
    this.dispatchEvent(
      new CustomEvent<JoystickInteractionStart>('interaction-start', {
        bubbles: true,
        composed: true,
        detail: { source: session.source }
      })
    );
    this.#checkAvailability();
  }

  #input(value: JoystickValue) {
    if (sameVector(this.value, value)) return;
    this.#writingInput = true;
    try {
      this.value = value;
    } finally {
      this.#writingInput = false;
    }
    if (this.#session) this.#lastInput = value;
    if (this.#session) this.#session.changed = true;
    this.dispatchInputEvent();
    this.#checkAvailability();
    if (this.#session && this.#lastInput === value) this.#queueFeedback(value, 'position');
  }

  #end(reason: JoystickInteractionEnd['reason']) {
    const session = this.#session;
    if (!session) return;
    const lastInput = this.#lastInput;
    this.#session = undefined;
    this.#keys.clear();
    this._internals.states.delete('active');
    this.#releasePointer(session.pointerId);
    if (reason !== 'reset' && (reason !== 'release' || this.release !== 'hold')) {
      this.#input({ x: 0, y: 0 });
    }
    this.#finishFeedback(reason, this.#lastInput ? lastInput : undefined);
    if (reason === 'release' && session.changed) this.dispatchChangeEvent();
    this.dispatchEvent(
      new CustomEvent<JoystickInteractionEnd>('interaction-end', {
        bubbles: true,
        composed: true,
        detail: { source: session.source, reason }
      })
    );
  }

  #finishFeedback(reason: JoystickInteractionEnd['reason'], lastInput: JoystickValue | undefined) {
    if (reason === 'escape') {
      if (sameVector(this.value, { x: 0, y: 0 })) this.#queueFeedback({ x: 0, y: 0 }, 'position');
    } else if (reason === 'release' && lastInput) {
      if (this.release === 'hold' && sameVector(this.value, lastInput)) this.#queueFeedback(lastInput, 'position');
      else if (this.release !== 'hold' && sameVector(this.value, { x: 0, y: 0 }))
        this.#queueFeedback(lastInput, 'return');
    } else {
      this.#clearFeedback();
    }
  }

  #describePosition(value: JoystickValue | undefined): string {
    if (!value) return this.i18n.joystickNoPosition ?? i18nDefaults.joystickNoPosition;
    let formatter: Intl.NumberFormat;
    const options = { maximumFractionDigits: 6, useGrouping: false };
    try {
      formatter = new Intl.NumberFormat(globalThis.document?.documentElement.lang || undefined, options);
    } catch {
      formatter = new Intl.NumberFormat(undefined, options);
    }
    const format = (number: number) => formatter.format(Number(number.toFixed(6)) || 0);
    return (this.i18n.joystickPosition ?? '').replaceAll('{x}', format(value.x)).replaceAll('{y}', format(value.y));
  }

  get #canAnnounce() {
    return (
      this.isConnected &&
      this.matches(':focus') &&
      !this.disabled &&
      !this.readOnly &&
      this.announce !== 'off' &&
      !globalThis.document.hidden
    );
  }

  #queueFeedback(value: JoystickValue, kind: 'position' | 'return') {
    if (!this.#canAnnounce) return;
    this.#pendingFeedback = { value, kind };
    if (this.#announcementTimer !== undefined) return;
    this.#announcementTimer = setTimeout(() => {
      this.#announcementTimer = undefined;
      const feedback = this.#pendingFeedback;
      this.#pendingFeedback = undefined;
      if (!feedback || !this.#canAnnounce) return;
      const position = this.#describePosition(feedback.value);
      const message =
        feedback.kind === 'return' ? this.i18n.joystickReturnedToCenter?.replaceAll('{position}', position) : position;
      if (!message || message === this.#announcement) return;
      this.#announcement = message;
      this.requestUpdate();
    }, 500);
  }

  #clearFeedback() {
    clearTimeout(this.#announcementTimer);
    this.#announcementTimer = undefined;
    this.#pendingFeedback = undefined;
    if (this.#announcement) {
      this.#announcement = '';
      this.requestUpdate();
    }
  }

  #releasePointer(pointerId: number | undefined) {
    if (pointerId === undefined) return;
    if (this.hasPointerCapture(pointerId)) this.releasePointerCapture(pointerId);
    this.#gestureController.target = undefined;
    if (this.isConnected && this.hasUpdated) this.#gestureController.target = this;
  }

  #checkAvailability() {
    if (this.disabled || this.readOnly) {
      this.#end(this.disabled ? 'disabled' : 'readonly');
      this.#clearFeedback();
    }
  }

  #movePointer(event: PointerEvent) {
    const bounds = this.shadowRoot?.querySelector('.travel')?.getBoundingClientRect();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return;
    this.#input(
      this.#constrain({
        x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        y: ((event.clientY - bounds.top) / bounds.height) * 2 - 1
      })
    );
  }

  #handleGestureInput = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const input: GestureInput = event.detail;
    this.#checkAvailability();
    if (input.kind === 'pointerdown') {
      this.#startPointer(input);
    } else if (input.kind === 'pointerend' && this.#session?.pointerId === input.event.pointerId) {
      if (!input.interrupted) this.#movePointer(input.event);
      this.#end(input.interrupted ? (input.reason === 'cancel' ? 'pointer-cancel' : 'lost-capture') : 'release');
    }
  };

  #startPointer(input: Extract<GestureInput, { kind: 'pointerdown' }>) {
    if (!this.hasUpdated || this.disabled || this.readOnly || this.#session || input.event.button !== 0) return;
    if (!input.claim({ kind: 'drag' })) return;
    input.event.preventDefault();
    // Touch controls can operate together without transferring keyboard focus.
    if (input.event.pointerType !== 'touch') this.focus({ preventScroll: true });
    this.#begin({ source: 'pointer', pointerId: input.event.pointerId, changed: false });
    if (this.#session) this.#movePointer(input.event);
  }

  #handleGesture = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const gesture: Gesture<undefined> = event.detail;
    this.#checkAvailability();
    if (gesture.kind === 'drag' && this.#session?.pointerId === gesture.event.pointerId) {
      this.#movePointer(gesture.event);
    }
  };

  #handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.#session) {
      event.preventDefault();
      this.#end('escape');
      return;
    }
    const direction = directions[event.key];
    if (!direction || !this.#acceptKey(event, direction)) return;
    event.preventDefault();
    this.#keys.add(event.key);
    if (!this.#session) this.#begin({ source: 'keyboard', changed: false });
    if (!this.#session) return;
    this.#moveKey(direction);
  };

  #moveKey(direction: JoystickValue) {
    const step = this.#step;
    const value = this.value ?? { x: 0, y: 0 };
    this.#input(
      this.#constrain({
        x: Number((value.x + direction.x * step).toFixed(6)),
        y: Number((value.y + direction.y * step).toFixed(6))
      })
    );
  }

  get #step() {
    return Number.isFinite(this.keyboardStep) && this.keyboardStep > 0 && this.keyboardStep <= 1
      ? this.keyboardStep
      : 0.1;
  }

  #acceptKey(event: KeyboardEvent, direction: JoystickValue) {
    if (event.altKey || event.ctrlKey || event.metaKey || this.disabled || this.readOnly) return false;
    if (this.#session?.source === 'pointer') return false;
    if (this.constraint === 'horizontal') return direction.y === 0;
    if (this.constraint === 'vertical') return direction.x === 0;
    return true;
  }

  #handleKeyUp = (event: KeyboardEvent) => {
    if (this.#session?.source !== 'keyboard' || !this.#keys.delete(event.key)) return;
    event.preventDefault();
    if (!this.#keys.size) this.#end('release');
  };

  #handleBlur = () => {
    this.#checkAvailability();
    this.#end('blur');
    this.#clearFeedback();
  };
  #handleVisibility = () => {
    if (globalThis.document.hidden) {
      this.#end('hidden');
      this.#clearFeedback();
    }
  };
}

function isVector(value: unknown): value is JoystickValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    Object.keys(value).length === 2
  );
}

function sameVector(first: JoystickValue | undefined, second: JoystickValue): boolean {
  return first !== undefined && Math.abs(first.x - second.x) < 1e-12 && Math.abs(first.y - second.y) < 1e-12;
}

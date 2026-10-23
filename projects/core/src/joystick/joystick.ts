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
 * Applications own physical units, coordinate frames, input shaping, publishing cadence, and recording clocks.
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

  readonly #gestureController = new GestureController(this, { touchAction: 'none', suppressNativeDrag: true });
  readonly #keys = new Set<string>();
  #session?: Session;
  #resetting = false;

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
    super.connectedCallback();
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
    if (changes.has('constraint') || changes.has('release') || changes.has('keyboardStep')) {
      this.#end('configuration-change');
      if (this.value) {
        const value = this.#constrain(this.value);
        if (!sameVector(this.value, value)) this.value = value;
      }
    }
  }

  updated() {
    this.tabIndex = this.disabled ? -1 : 0;
    // Editable joysticks own the two-axis keyboard interaction, including release and cancellation.
    this._internals.role = this.disabled || this.readOnly ? 'group' : 'application';
    this._internals.ariaLabel = this.ariaLabel || this.composedLabel || null;
    this._internals.ariaReadOnly = null;
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
  }

  override reset() {
    this.#end('reset');
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
    this.value = value;
    if (this.#session) this.#session.changed = true;
    this.dispatchInputEvent();
    this.#checkAvailability();
  }

  #end(reason: JoystickInteractionEnd['reason']) {
    const session = this.#session;
    if (!session) return;
    this.#session = undefined;
    this.#keys.clear();
    this._internals.states.delete('active');
    this.#releasePointer(session.pointerId);
    if (reason !== 'reset' && (reason !== 'release' || this.release !== 'hold')) {
      this.#input({ x: 0, y: 0 });
    }
    if (reason === 'release' && session.changed) this.dispatchChangeEvent();
    this.dispatchEvent(
      new CustomEvent<JoystickInteractionEnd>('interaction-end', {
        bubbles: true,
        composed: true,
        detail: { source: session.source, reason }
      })
    );
  }

  #releasePointer(pointerId: number | undefined) {
    if (pointerId === undefined) return;
    if (this.hasPointerCapture(pointerId)) this.releasePointerCapture(pointerId);
    this.#gestureController.target = undefined;
    if (this.isConnected && this.hasUpdated) this.#gestureController.target = this;
  }

  #checkAvailability() {
    if (this.disabled) this.#end('disabled');
    else if (this.readOnly) this.#end('readonly');
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

  #handleBlur = () => this.#end('blur');
  #handleVisibility = () => {
    if (globalThis.document.hidden) this.#end('hidden');
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

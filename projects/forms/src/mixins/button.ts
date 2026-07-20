// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TypeAnchorController } from '../internal/controllers/type-anchor.controller.js';
import { TypeButtonController } from '../internal/controllers/type-button.controller.js';
import { TypeCommandController } from '../internal/controllers/type-command.controller.js';
import { TypeInterestInvokerController } from '../internal/controllers/type-interest-invoker.controller.js';
import { TypeSubmitController } from '../internal/controllers/type-submit.controller.js';
import { TypePopoverTriggerController } from '../internal/controllers/type-popover-trigger.controller.js';
import { StateActiveController } from '../internal/controllers/state-active.controller.js';
import { StateCurrentController } from '../internal/controllers/state-current.controller.js';
import { StateDisabledController } from '../internal/controllers/state-disabled.controller.js';
import { StateExpandedController } from '../internal/controllers/state-expanded.controller.js';
import { StatePressedController } from '../internal/controllers/state-pressed.controller.js';
import { StateReadOnlyController } from '../internal/controllers/state-readonly.controller.js';
import { StateSelectedController } from '../internal/controllers/state-selected.controller.js';
import type { ReactiveController } from '../internal/controllers/types.js';
import {
  attachInternals,
  getFlattenedDOMTree,
  getStringValue,
  hasAttributeValue,
  isFormElement,
  setAttributeValue
} from '../internal/utils.js';
import type { ButtonFormControlMixinInstance, ButtonType, CurrentState, PopoverTargetAction } from './button.types.js';
export type { ButtonFormControlMixinInstance, ButtonType, CurrentState, PopoverTargetAction } from './button.types.js';

type ChangedProperties = Map<PropertyKey, unknown>;
interface ButtonFormControlHost {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
  requestUpdate?(name?: string, oldValue?: unknown): void;
  updateComplete?: Promise<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = (new (...args: any[]) => HTMLElement & ButtonFormControlHost) & { observedAttributes?: string[] };

interface BooleanStateOptions {
  property: string;
  value: boolean;
  reflect: boolean;
  attribute?: string;
}

interface StringStateOptions {
  property: string;
  value: unknown;
  attribute?: string;
  reflect?: boolean;
}

const ELEMENT_TARGET_PROPERTIES = {
  commandfor: 'commandForElement',
  interestfor: 'interestForElement',
  popovertarget: 'popoverTargetElement'
} as const;
type ElementTargetAttribute = keyof typeof ELEMENT_TARGET_PROPERTIES;
type ElementTargetProperty = (typeof ELEMENT_TARGET_PROPERTIES)[ElementTargetAttribute];

type ButtonFormControlConstructor<TBase extends Constructor> = new (
  ...args: ConstructorParameters<TBase>
) => InstanceType<TBase> & ButtonFormControlMixinInstance;
export type ButtonFormControlMixinReturn<TBase extends Constructor> = ButtonFormControlConstructor<TBase> & {
  formAssociated: boolean;
  observedAttributes: string[];
} & Omit<TBase, 'prototype'>;

/**
 * @description A mixin that adds native button-style form, command, popover, and interaction behavior.
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
export function ButtonFormControlMixin<TBase extends Constructor>(
  SuperClass: TBase
): ButtonFormControlMixinReturn<TBase> {
  return class ButtonFormControlBase extends SuperClass {
    static formAssociated = true;

    #command: string | undefined;
    #current: CurrentState | undefined;
    #disabled = false;
    #elementTargets: Record<ElementTargetProperty, HTMLElement | null> = {
      commandForElement: null,
      interestForElement: null,
      popoverTargetElement: null
    };
    #expanded: boolean | undefined;
    #form: string | HTMLFormElement | null = null;
    #hasConnected = false;
    #name: string | undefined;
    #pendingAttributeReflections = new Map<string, string | null>();
    #popoverTargetAction: PopoverTargetAction | undefined;
    #pressed: boolean | undefined;
    #readOnly = false;
    #selected: boolean | undefined;
    #syncQueued = false;
    #type: ButtonType | undefined;
    #value: string | undefined;

    _internals = attachInternals(this);

    static get observedAttributes() {
      return (super.observedAttributes ?? []).concat([
        'pressed',
        'expanded',
        'readonly',
        'form',
        'name',
        'value',
        'type',
        'disabled',
        'selected',
        'current',
        'popovertarget',
        'popovertargetaction',
        'commandfor',
        'command',
        'interestfor'
      ]);
    }

    get pressed(): boolean {
      return this.#pressed as boolean;
    }

    set pressed(value: boolean | unknown) {
      this.#setBooleanState({ property: 'pressed', value: Boolean(value), reflect: true });
    }

    get expanded(): boolean {
      return this.#expanded as boolean;
    }

    set expanded(value: boolean | unknown) {
      this.#setBooleanState({ property: 'expanded', value: Boolean(value), reflect: true });
    }

    get readOnly(): boolean {
      return this.#readOnly || Boolean(this._typeAnchorController?.readOnly);
    }

    set readOnly(value: boolean | unknown) {
      this.#setBooleanState({ property: 'readOnly', value: Boolean(value), reflect: true, attribute: 'readonly' });
    }

    get readonly(): boolean {
      return this.readOnly;
    }

    set readonly(value: boolean) {
      this.readOnly = value;
    }

    set form(form: string | HTMLFormElement | null) {
      const oldValue = this.form;
      this.#form = form;
      if (typeof form === 'string') {
        this.setAttribute('form', form);
      } else {
        this.removeAttribute('form');
      }
      this.#requestHostUpdate('form', oldValue);
      this.#queueBehaviorSync();
    }

    get form(): HTMLFormElement | null | string {
      if (this.#form && typeof this.#form !== 'string') {
        return this.#form;
      }

      if (typeof this.#form === 'string' && typeof globalThis.document !== 'undefined') {
        const rootNode = this.getRootNode() as Document | ShadowRoot;
        const form = rootNode.getElementById ? rootNode.getElementById(this.#form) : null;
        return isFormElement(form) ? form : null;
      }

      return this._internals?.form ?? null;
    }

    get name(): string {
      return this.#name as string;
    }

    set name(value: string | unknown) {
      this.#setStringState({ property: 'name', value });
    }

    get value(): string {
      return this.#value as string;
    }

    set value(value: string | unknown) {
      this.#setStringState({ property: 'value', value });
    }

    get type(): ButtonType {
      return (this.#type ?? this._typeSubmitController?.defaultType) as ButtonType;
    }

    set type(value: ButtonType | unknown) {
      this.#setStringState({ property: 'type', value });
    }

    get disabled(): boolean {
      return this.#disabled;
    }

    set disabled(value: boolean | unknown) {
      this.#setBooleanState({ property: 'disabled', value: Boolean(value), reflect: true });
    }

    get selected(): boolean {
      return this.#selected as boolean;
    }

    set selected(value: boolean | unknown) {
      this.#setBooleanState({ property: 'selected', value: Boolean(value), reflect: true });
    }

    get current(): CurrentState {
      return this.#current as CurrentState;
    }

    set current(value: CurrentState | unknown) {
      this.#setStringState({ property: 'current', value });
    }

    get popoverTargetElement(): HTMLElement | null {
      return this.#getElementTarget('popovertarget');
    }

    set popoverTargetElement(value: HTMLElement | null) {
      this.#setElementTarget('popovertarget', value);
    }

    get popoverTargetAction(): PopoverTargetAction {
      return this.#popoverTargetAction === 'show' || this.#popoverTargetAction === 'hide'
        ? this.#popoverTargetAction
        : 'toggle';
    }

    set popoverTargetAction(value: PopoverTargetAction | unknown) {
      this.#setStringState({ property: 'popoverTargetAction', value, attribute: 'popovertargetaction' });
    }

    get commandForElement(): HTMLElement | null {
      return this.#getElementTarget('commandfor');
    }

    set commandForElement(value: HTMLElement | null) {
      this.#setElementTarget('commandfor', value);
    }

    get command(): string {
      return this.#command as string;
    }

    set command(value: string | unknown) {
      this.#setStringState({ property: 'command', value });
    }

    get interestForElement(): HTMLElement | null {
      return this.#getElementTarget('interestfor');
    }

    set interestForElement(value: HTMLElement | null) {
      this.#setElementTarget('interestfor', value);
    }

    protected _controllers?: Set<ReactiveController>;
    protected _typeAnchorController = new TypeAnchorController(this);
    protected _typeButtonController = new TypeButtonController(this);
    protected _typeSubmitController = new TypeSubmitController(this);
    protected _typeCommandController = new TypeCommandController(this);
    protected _typeInterestInvokerController = new TypeInterestInvokerController(this);
    protected _typePopoverTriggerController = new TypePopoverTriggerController(this);
    protected _stateActiveController = new StateActiveController(this);
    protected _stateDisabledController = new StateDisabledController(this);
    protected _stateExpandedController = new StateExpandedController(this);
    protected _statePressedController = new StatePressedController(this);
    protected _stateSelectedController = new StateSelectedController(this);
    protected _stateCurrentController = new StateCurrentController(this);
    protected _stateReadOnlyController = new StateReadOnlyController(this);

    addController(controller: ReactiveController) {
      this._controllers ??= new Set<ReactiveController>();
      this._controllers.add(controller);
    }

    connectedCallback() {
      super.connectedCallback?.();
      this._controllers?.forEach(controller => controller.hostConnected?.());
      attachInternals(this);
      this.#hasConnected = true;
      this.#flushPendingAttributeReflections();

      this.#syncBehavior();
      this.#queueBehaviorSync();
    }

    disconnectedCallback() {
      this._controllers?.forEach(controller => controller.hostDisconnected?.());
      super.disconnectedCallback?.();
    }

    protected updated(changedProperties: ChangedProperties) {
      const superUpdated = Object.getPrototypeOf(ButtonFormControlBase.prototype).updated as
        | ((changedProperties: ChangedProperties) => void)
        | undefined;
      superUpdated?.call(this, changedProperties);
      this.#syncQueued = false;
      this.#syncBehavior();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      super.attributeChangedCallback?.(name, oldValue, newValue);

      if (oldValue === newValue) {
        return;
      }

      this.#handleBooleanAttributeChange(name, newValue);
      this.#handleElementTargetAttributeChange(name, oldValue);
      this.#handleStringAttributeChange(name, oldValue, newValue);
    }

    #queueBehaviorSync() {
      if (!this.isConnected || this.#syncQueued) {
        return;
      }

      this.#syncQueued = true;
      void this.#getHostUpdateComplete().then(() => {
        if (!this.#syncQueued) return;
        this.#syncQueued = false;
        if (this.isConnected) this.#syncBehavior();
      });
    }

    #syncBehavior() {
      this._controllers?.forEach(controller => controller.hostUpdated?.());
    }

    #handleBooleanAttributeChange(name: string, newValue: string | null) {
      if (name === 'pressed' || name === 'expanded' || name === 'selected' || name === 'disabled') {
        this.#setBooleanState({ property: name, value: newValue !== null, reflect: false });
      }

      if (name === 'readonly') {
        this.#setBooleanState({ property: 'readOnly', value: newValue !== null, reflect: false });
      }
    }

    #handleStringAttributeChange(name: string, oldValue: string | null, newValue: string | null) {
      if (name === 'commandfor' || name === 'interestfor' || name === 'popovertarget') {
        return;
      }

      if (name === 'form') {
        if (!(isFormElement(this.#form) && newValue === null)) {
          this.#form = newValue;
          this.#requestHostUpdate('form', oldValue);
        }
      }

      if (name === 'popovertargetaction') {
        this.#setStringState({ property: 'popoverTargetAction', value: newValue, reflect: false });
        return;
      }

      this.#setStringState({ property: name, value: newValue, reflect: false });
    }

    #handleElementTargetAttributeChange(name: string, oldValue: string | null) {
      const property = ELEMENT_TARGET_PROPERTIES[name as ElementTargetAttribute];
      if (!property) {
        return;
      }

      const oldTarget = this.#elementTargets[property] ?? this.#getElementById(oldValue);
      this.#elementTargets[property] = null;
      this.#requestHostUpdate(property, oldTarget);
      this.#queueBehaviorSync();
    }

    #getElementTarget(attribute: ElementTargetAttribute) {
      return (
        this.#elementTargets[ELEMENT_TARGET_PROPERTIES[attribute]] ?? this.#getElementById(this.getAttribute(attribute))
      );
    }

    #getElementById(id: string | null) {
      return id ? (getFlattenedDOMTree(this.getRootNode()).find(element => element.id === id) ?? null) : null;
    }

    #setElementTarget(attribute: ElementTargetAttribute, value: HTMLElement | null) {
      const property = ELEMENT_TARGET_PROPERTIES[attribute];
      const oldValue = this[property];
      if (oldValue === value && hasAttributeValue(this, attribute, value ? '' : null)) {
        return;
      }
      setAttributeValue(this, attribute, value ? '' : null);
      this.#elementTargets[property] = value;
      this.#requestHostUpdate(property, oldValue);
      this.#queueBehaviorSync();
    }

    #setBooleanState({ property, value, reflect, attribute = property }: BooleanStateOptions) {
      const oldValue = this.#getBooleanValue(property);
      if (oldValue === value && (!reflect || hasAttributeValue(this, attribute, value ? '' : null))) {
        return;
      }

      this.#setBooleanValue(property, value);
      if (reflect && this.#reflectAttribute(attribute, value ? '' : null)) {
        return;
      }
      this.#requestHostUpdate(property, oldValue);
      this.#queueBehaviorSync();
    }

    #getBooleanValue(property: string) {
      return {
        disabled: this.#disabled,
        expanded: this.#expanded,
        pressed: this.#pressed,
        readOnly: this.#readOnly,
        selected: this.#selected
      }[property];
    }

    #setBooleanValue(property: string, value: boolean) {
      if (property === 'disabled') {
        this.#disabled = value;
      } else if (property === 'expanded') {
        this.#expanded = value;
      } else if (property === 'pressed') {
        this.#pressed = value;
      } else if (property === 'readOnly') {
        this.#readOnly = value;
      } else if (property === 'selected') {
        this.#selected = value;
      }
    }

    #setStringState({ property, value, attribute = property, reflect = true }: StringStateOptions) {
      const oldValue = this.#getStringValue(property);
      const nextValue = getStringValue(value);
      if (oldValue === nextValue && (!reflect || hasAttributeValue(this, attribute, nextValue))) {
        return;
      }

      this.#setStringValue(property, nextValue);
      if (reflect && this.#reflectAttribute(attribute, nextValue)) {
        return;
      }
      this.#requestHostUpdate(property, oldValue);
      this.#queueBehaviorSync();
    }

    #getStringValue(property: string) {
      return {
        command: this.#command,
        current: this.#current,
        name: this.#name,
        popoverTargetAction: this.#popoverTargetAction,
        type: this.#type,
        value: this.#value
      }[property];
    }

    #setStringValue(property: string, value: string | null) {
      const setters: Record<string, () => void> = {
        command: () => (this.#command = value ?? undefined),
        current: () => (this.#current = value as CurrentState),
        name: () => (this.#name = value ?? undefined),
        popoverTargetAction: () => (this.#popoverTargetAction = value as PopoverTargetAction),
        type: () => (this.#type = value as ButtonType),
        value: () => (this.#value = value ?? undefined)
      };
      setters[property]?.();
    }

    #reflectAttribute(attribute: string, value: string | null) {
      if (!this.isConnected && !this.#hasConnected) {
        if (!this.hasAttribute(attribute)) {
          this.#pendingAttributeReflections.set(attribute, value);
        }
        return true;
      }

      setAttributeValue(this, attribute, value);
      return false;
    }

    #requestHostUpdate(name?: string, oldValue?: unknown) {
      this.requestUpdate?.(name, oldValue);
    }

    #getHostUpdateComplete() {
      return this.updateComplete ?? Promise.resolve();
    }

    #flushPendingAttributeReflections() {
      this.#pendingAttributeReflections.forEach((value, attribute) => setAttributeValue(this, attribute, value));
      this.#pendingAttributeReflections.clear();
    }
  } as unknown as ButtonFormControlMixinReturn<TBase>;
}

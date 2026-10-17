// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveControllerHost } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import type { Dropdown } from '@nvidia-elements/core/dropdown';
import type { I18nStrings } from '@nvidia-elements/core/internal';
import { isWorkspacePlacement, type WorkspacePlacement, type WorkspaceSide } from './workspace-command.utils.js';

interface ActionOptions {
  strings: () => Partial<I18nStrings>;
  admits: (anchor: string, placement: WorkspacePlacement) => boolean;
  groups: () => string[][];
  groupSource: (id: string) => string[];
  label: (id: string) => string;
  move: (anchor: string, placement: WorkspacePlacement) => void;
}

/** Provides click, touch, and keyboard alternatives using the same explicit placements as invokers. */
export class WorkspaceActionsController {
  readonly #host: HTMLElement & ReactiveControllerHost;

  readonly #options: ActionOptions;

  #anchor?: string;

  #wholePane = false;

  #trigger?: HTMLElement;

  #returnFocus = false;

  #target = '';

  #operation: WorkspacePlacement['operation'] = 'tab';

  #side: WorkspaceSide = 'left';

  #relation: 'before' | 'after' = 'before';

  #scope: 'arrangement' | 'workspace' = 'arrangement';

  constructor(host: HTMLElement & ReactiveControllerHost, options: ActionOptions) {
    this.#host = host;
    this.#options = options;
  }

  clear() {
    const dropdown = this.#host.shadowRoot?.querySelector<Dropdown>('#workspace-actions');
    if (dropdown?.matches(':popover-open')) dropdown.hidePopover();
    this.#returnFocus = false;
    this.#anchor = undefined;
    this.#trigger = undefined;
    this.#host.requestUpdate();
  }

  prepare(anchor: string, trigger: HTMLElement, wholePane = false) {
    this.#anchor = anchor;
    this.#wholePane = wholePane;
    this.#trigger = trigger;
    this.#target = '';
    this.#operation = 'tab';
    this.#scope = 'arrangement';
    this.#host.requestUpdate();
  }

  open(anchor: string, trigger: HTMLElement, wholePane = false) {
    this.prepare(anchor, trigger, wholePane);
    void this.#host.updateComplete.then(() => {
      if (!this.#host.isConnected || this.#anchor !== anchor || this.#trigger !== trigger) return;
      const dropdown = this.#host.shadowRoot?.querySelector<Dropdown>('#workspace-actions');
      if (dropdown && !dropdown.matches(':popover-open')) dropdown.showPopover();
    });
  }

  renderActions() {
    const source = this.#source();
    const targets = this.#options
      .groups()
      .flat()
      .filter(id => !source.includes(id));
    const target = this.#currentTarget(targets);
    const strings = this.#options.strings();
    const group = this.#anchor ? this.#options.groupSource(this.#anchor) : [];
    return html`<nve-dropdown id="workspace-actions" part="dropdown" data-actions .modal=${false} .anchor=${this.#trigger} alignment="end" @close=${() => this.#close()} @keydown=${(
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') this.#returnFocus = true;
    }}><div class="actions" role="group" aria-label=${ifDefined(strings.workspaceArrangePanels)} @close=${(event: Event) => event.stopPropagation()}>
      ${
        group.length > 1
          ? html`<nve-button type="button" part="button" ?data-move-group=${!this.#wholePane} ?data-move-panel=${this.#wholePane} @click=${() => {
              this.#wholePane = !this.#wholePane;
              this.#host.requestUpdate();
            }}>${this.#wholePane ? strings.workspacePanel : strings.workspaceGroup}</nve-button>`
          : null
      }
      ${this.#renderOperation(strings)}
      ${this.#operation === 'insert' ? this.#renderScope(strings) : null}
      <nve-select part="select"><label>${strings.workspaceDestination}</label><select data-target aria-label=${ifDefined(strings.workspaceDestination)} ?disabled=${!source.length || !targets.length || (this.#operation === 'insert' && this.#scope === 'workspace')} @change=${(
        event: Event
      ) => {
        if (event.target instanceof HTMLSelectElement) this.#target = event.target.value;
        this.#host.requestUpdate();
      }}>${targets.map(id => html`<option value=${id} .selected=${live(id === target)}>${this.#options.label(id)}</option>`)}</select></nve-select>
      ${this.#renderPosition(target, strings)}
      <nve-button type="button" part="button" data-apply ?disabled=${!this.#allowed(this.#placement(target))} @click=${() => this.#apply(this.#placement(target))}>${strings.workspaceMove}</nve-button>
      ${!this.#wholePane ? this.#renderTabOrder(strings) : null}
      <nve-button type="button" part="button" data-cancel @click=${() => {
        this.#returnFocus = true;
      }} popovertarget="workspace-actions" popovertargetaction="hide">${strings.workspaceCancel}</nve-button>
    </div></nve-dropdown>`;
  }

  #close() {
    const trigger = this.#trigger;
    const returnFocus = this.#returnFocus;
    this.clear();
    if (returnFocus && trigger?.isConnected) trigger.focus();
  }

  #source() {
    return this.#anchor ? (this.#wholePane ? this.#options.groupSource(this.#anchor) : [this.#anchor]) : [];
  }

  #placement(target: string): WorkspacePlacement {
    const source = this.#wholePane ? 'pane' : 'panel';
    switch (this.#operation) {
      case 'tab':
        return { operation: 'tab', source, target };
      case 'split':
        return { operation: 'split', source, target, position: this.#side };
      case 'order':
        return { operation: 'order', source, target, position: this.#relation };
      case 'insert':
        return this.#scope === 'workspace'
          ? { operation: 'insert', source, scope: 'workspace', position: this.#side }
          : { operation: 'insert', source, scope: 'arrangement', target, position: this.#side };
    }
  }

  #allowed(placement: WorkspacePlacement | undefined) {
    return !!placement && !!this.#anchor && this.#options.admits(this.#anchor, placement);
  }

  #currentTarget(targets: string[]) {
    return targets.includes(this.#target) ? this.#target : (targets[0] ?? '');
  }

  #renderOperation(strings: Partial<I18nStrings>) {
    const choices = [
      ['tab', strings.workspaceJoin],
      ['split', strings.workspaceSplit],
      ['order', strings.workspaceOrder],
      ['insert', strings.workspaceInsert]
    ] as const;
    return html`<nve-select part="select"><label>${strings.workspaceOperation}</label><select data-operation aria-label=${ifDefined(strings.workspaceOperation)} @change=${(
      event: Event
    ) => {
      if (event.target instanceof HTMLSelectElement) {
        const value = event.target.value;
        const selected = choices.find(([kind]) => kind === value);
        if (selected) this.#operation = selected[0];
      }
      this.#host.requestUpdate();
    }}>${choices.map(([kind, label]) => html`<option value=${kind} .selected=${live(kind === this.#operation)}>${label}</option>`)}</select></nve-select>`;
  }

  #renderScope(strings: Partial<I18nStrings>) {
    return html`<nve-select part="select"><label>${strings.workspaceScope}</label><select data-scope aria-label=${ifDefined(strings.workspaceScope)} @change=${(
      event: Event
    ) => {
      if (event.target instanceof HTMLSelectElement)
        this.#scope = event.target.value === 'workspace' ? 'workspace' : 'arrangement';
      this.#host.requestUpdate();
    }}><option value="arrangement" .selected=${live(this.#scope === 'arrangement')}>${strings.workspaceArrangement}</option><option value="workspace" .selected=${live(this.#scope === 'workspace')}>${strings.workspaceEntire}</option></select></nve-select>`;
  }

  #renderPosition(target: string, strings: Partial<I18nStrings>) {
    if (this.#operation === 'tab') return null;
    const choices =
      this.#operation === 'order'
        ? ([
            ['before', strings.workspaceBefore],
            ['after', strings.workspaceAfter]
          ] as const)
        : ([
            ['left', strings.workspaceLeft],
            ['right', strings.workspaceRight],
            ['top', strings.workspaceAbove],
            ['bottom', strings.workspaceBelow]
          ] as const);
    const current = this.#operation === 'order' ? this.#relation : this.#side;
    const allowed = (position: string) => {
      const request = { ...this.#placement(target), position };
      return isWorkspacePlacement(request) && this.#allowed(request);
    };
    return html`<nve-select part="select"><label>${strings.workspacePlacement}</label><select data-position aria-label=${ifDefined(strings.workspacePlacement)} ?disabled=${!choices.some(([position]) => allowed(position))} @change=${(
      event: Event
    ) => {
      if (!(event.target instanceof HTMLSelectElement)) return;
      const value = event.target.value;
      if (value === 'before' || value === 'after') this.#relation = value;
      else if (value === 'left' || value === 'right' || value === 'top' || value === 'bottom') this.#side = value;
      this.#host.requestUpdate();
    }}>${choices.map(([position, label]) => html`<option value=${position} .selected=${live(current === position)} ?disabled=${!allowed(position)}>${label}</option>`)}</select></nve-select>`;
  }

  #renderTabOrder(strings: Partial<I18nStrings>) {
    return html`<nve-button type="button" part="button" data-before ?disabled=${!this.#tabOrder(-1)} @click=${() => this.#apply(this.#tabOrder(-1))}>${strings.workspaceEarlier}</nve-button><nve-button type="button" part="button" data-after ?disabled=${!this.#tabOrder(1)} @click=${() => this.#apply(this.#tabOrder(1))}>${strings.workspaceLater}</nve-button>`;
  }

  #tabOrder(direction: number): WorkspacePlacement | undefined {
    const id = this.#anchor;
    if (!id) return undefined;
    const group = this.#options.groups().find(item => item.includes(id));
    const index = group?.indexOf(id) ?? -1;
    const target = group?.[index + direction];
    if (!target) return undefined;
    const preferredIndex = this.#options.groupSource(id).indexOf(target);
    const placement: WorkspacePlacement = { operation: 'tab', target, index: preferredIndex + (direction < 0 ? 0 : 1) };
    return this.#allowed(placement) ? placement : undefined;
  }

  #apply(placement: WorkspacePlacement | undefined) {
    if (this.#anchor && placement && this.#allowed(placement)) this.#options.move(this.#anchor, placement);
  }
}

// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import { getFlattenedDOMTree } from '@nvidia-elements/core/internal';
import { TypeCommandController } from '@nvidia-elements/forms/internal';
import { Viewport } from './viewport.js';

type ViewportControlHost = ReactiveElement & {
  readonly commandfor: string | null;
  commandForElement: HTMLElement | null;
};

type ViewportCommandHost = ViewportControlHost & {
  command?: string;
  disabled: boolean;
  readOnly: boolean;
};

/** Binds a navigation control to its command target and committed viewport state. */
export class ViewportControlController implements ReactiveController {
  target: Viewport | null = null;
  #connected = false;
  #commandTargetInput: HTMLElement | string | null | undefined;

  constructor(
    private readonly host: ViewportControlHost,
    private readonly onChange: (target: Viewport | null) => void,
    private readonly options: { readonly parentFallback?: boolean } = {}
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    this.#connected = true;
    this.#syncTarget();
  }

  hostUpdate(): void {
    this.#syncTarget();
  }

  hostDisconnected(): void {
    this.#connected = false;
    this.#commandTargetInput = undefined;
    this.#disconnectTarget();
    this.target = null;
    this.onChange(null);
  }

  #syncTarget(): void {
    if (!this.#connected) return;
    const commandTargetInput = this.#getCommandTargetInput();
    if (commandTargetInput === this.#commandTargetInput && this.#hasValidTarget(commandTargetInput)) return;
    const element =
      typeof commandTargetInput === 'string'
        ? getFlattenedDOMTree(this.host.getRootNode() as HTMLElement).find(
            candidate => candidate.id === commandTargetInput
          )
        : commandTargetInput;
    const target = element instanceof Viewport ? element : null;
    if (target) this.#commandTargetInput = commandTargetInput;
    if (target === this.target) return;
    this.#disconnectTarget();
    this.target = target;
    target?.addEventListener('viewportchange', this.#handleChange);
    target?.addEventListener('capabilitieschange', this.#handleChange);
    this.onChange(target);
  }

  #hasValidTarget(input: HTMLElement | string | null): boolean {
    return !!this.target && (typeof input !== 'string' || (this.target.isConnected && this.target.id === input));
  }

  #getCommandTargetInput(): HTMLElement | string | null {
    return (
      this.host.commandForElement ??
      (this.host.commandfor || (this.options.parentFallback ? this.host.parentElement : null))
    );
  }

  #disconnectTarget(): void {
    this.target?.removeEventListener('viewportchange', this.#handleChange);
    this.target?.removeEventListener('capabilitieschange', this.#handleChange);
  }

  #handleChange = (): void => this.onChange(this.target);
}

// eslint-disable-next-line local/require-component-metadata -- Controllers do not define custom elements.
export class ViewportCommandController extends TypeCommandController<ViewportCommandHost> {
  constructor(
    host: ViewportCommandHost,
    private readonly viewportControl: ViewportControlController
  ) {
    super(host, { events: ['input'] });
  }

  override get target(): Viewport | null {
    return this.viewportControl.target;
  }
}

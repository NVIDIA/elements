// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneErrorDetail } from '../errors.js';

export class DiagnosticEpisodes {
  readonly #active = new Set<string>();

  update(options: {
    element: Element;
    code: string;
    active: boolean;
    message: string;
    severity: SceneErrorDetail['severity'];
  }): void {
    if (!options.active) {
      this.#active.delete(options.code);
      return;
    }
    if (this.#active.has(options.code)) {
      return;
    }
    this.#active.add(options.code);
    const detail: SceneErrorDetail = {
      code: options.code,
      element: options.element,
      message: options.message,
      severity: options.severity
    };
    const log = options.severity === 'error' ? console.error : console.warn;
    log(`[${options.code}] ${options.message}`, options.element);
    options.element.dispatchEvent(
      new CustomEvent<SceneErrorDetail>('nve-scene-error', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail
      })
    );
  }
}

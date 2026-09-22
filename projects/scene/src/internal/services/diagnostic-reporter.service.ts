// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneErrorCode, SceneErrorDetail } from '../../errors.js';

class DiagnosticReporterService {
  readonly #active = new WeakMap<Element, Set<string>>();

  update(options: {
    element: Element;
    code: SceneErrorCode;
    active: boolean;
    message: string;
    severity: SceneErrorDetail['severity'];
    /** Distinguishes simultaneous episodes that intentionally share one public diagnostic code. */
    episodeKey?: string;
  }): void {
    const { active, code, element, episodeKey, message, severity } = options;
    const key = episodeKey ?? code;
    const activeEpisodes = this.#active.get(element);
    if (!active) {
      activeEpisodes?.delete(key);
      if (activeEpisodes?.size === 0) this.#active.delete(element);
      return;
    }
    if (activeEpisodes?.has(key)) return;
    if (activeEpisodes) activeEpisodes.add(key);
    else this.#active.set(element, new Set([key]));
    const detail: SceneErrorDetail = {
      code,
      element,
      message,
      severity
    };
    const log = severity === 'error' ? console.error : console.warn;
    log(`[${code}] ${message}`, element);
    element.dispatchEvent(
      new CustomEvent<SceneErrorDetail>('nve-scene-error', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail
      })
    );
  }
}

export const diagnosticReporterService = new DiagnosticReporterService();

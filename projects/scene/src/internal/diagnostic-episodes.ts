// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneErrorCode, SceneErrorDetail } from '../errors.js';

type DiagnosticEpisodeTransition = 'started' | 'cleared' | 'unchanged';

export class DiagnosticEpisodes {
  readonly #active = new Set<string>();

  update(options: {
    element: Element;
    code: SceneErrorCode;
    active: boolean;
    message: string;
    severity: SceneErrorDetail['severity'];
    /** Distinguishes simultaneous episodes that intentionally share one public diagnostic code. */
    episodeKey?: string;
  }): DiagnosticEpisodeTransition {
    const { active, code, element, episodeKey, message, severity } = options;
    const key = episodeKey ?? code;
    if (!active) {
      return this.#active.delete(key) ? 'cleared' : 'unchanged';
    }
    if (this.#active.has(key)) {
      return 'unchanged';
    }
    this.#active.add(key);
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
    return 'started';
  }

  /** Clears all active episodes without dispatching a fabricated recovery event. */
  reset(): void {
    this.#active.clear();
  }
}

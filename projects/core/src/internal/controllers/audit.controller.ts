// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { GlobalStateService } from '../services/global.service.js';
import { auditSlots, auditParentElement } from '../utils/audit.js';

export const excessiveInstanceLimit = 50;

export interface AuditOptions {
  excessiveInstanceLimit?: number;
  alternates?: { name: string; use: string }[];
}

export interface AuditMetadata {
  parents?: string[];
  children?: string[];
  disallowedChildren?: string[];
}

interface AuditRegistry {
  [key: string]: {
    count?: number;
    excessiveInstanceLimitAudited?: boolean;
  };
}

async function log(message: string) {
  const { LogService } = await import('../services/log.service.js');
  LogService.warn(message);
}

export function audit<T extends Audit>(options: AuditOptions = {}): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new AuditController(instance, options));
}

export type Audit = ReactiveElement;

export class AuditController<T extends Audit> implements ReactiveController {
  get #hostAuditState() {
    return GlobalStateService.state.audit[this.host.localName] ?? { count: 0 };
  }

  get #production() {
    return GlobalStateService.state.env === 'production';
  }

  get #hostMetadata() {
    return (this.host.constructor as unknown as { metadata: AuditMetadata }).metadata;
  }

  constructor(
    private host: T,
    private options: AuditOptions
  ) {
    if (!this.#production) {
      this.host.addController(this);
      this.#initializeAudit();
    }
  }

  async hostConnected() {
    await this.host.updateComplete;
    if (!this.#production) {
      void this.#auditExcessiveInstanceLimit();
      void this.#auditSlots();
      void this.#auditParentElement();
    }
  }

  hostDisconnected() {
    this.#cleanupExcessiveInstanceLimit();
  }

  #initializeAudit() {
    if (!GlobalStateService.state.audit[this.host.localName]) {
      this.#update({ [this.host.localName]: { count: 0 } });
    }
  }

  async #auditExcessiveInstanceLimit() {
    if (this.options.excessiveInstanceLimit !== undefined) {
      if (
        this.#hostAuditState.count! > this.options.excessiveInstanceLimit &&
        !this.#hostAuditState.excessiveInstanceLimitAudited
      ) {
        const { getExcessiveInstanceLimitWarning } = await import('../utils/audit-logs.js');
        void log(getExcessiveInstanceLimitWarning(this.#hostAuditState.count!, this.host.localName));
        this.#update({
          [this.host.localName]: { count: this.#hostAuditState.count! + 1, excessiveInstanceLimitAudited: true }
        });
      } else {
        this.#update({ [this.host.localName]: { count: this.#hostAuditState.count! + 1 } });
      }
    }
  }

  #cleanupExcessiveInstanceLimit() {
    if (this.options.excessiveInstanceLimit) {
      this.#update({
        [this.host.localName]: { count: this.#hostAuditState.count! - 1, excessiveInstanceLimitAudited: false }
      });
    }
  }

  #update(audit: AuditRegistry) {
    GlobalStateService.dispatch('NVE_ELEMENTS_AUDIT_UPDATE', { audit } as Partial<
      typeof globalThis.NVE_ELEMENTS.state
    >);
  }

  async #auditSlots() {
    if (this.#hostMetadata.children || this.#hostMetadata.disallowedChildren) {
      const [invalidElements, validElements] = auditSlots(this.host);
      if (invalidElements.length) {
        const { getInvalidSlottedChildrenWarning } = await import('../utils/audit-logs.js');
        void log(getInvalidSlottedChildrenWarning(this.host.localName, validElements));
      }
    }
  }

  async #auditParentElement() {
    if (this.#hostMetadata.parents) {
      const [valid, validParents] = auditParentElement(this.host);
      if (!valid) {
        const { getInvalidParentWarning } = await import('../utils/audit-logs.js');
        void log(getInvalidParentWarning(this.host.localName, validParents.join(', ')));
      }
    }
  }
}

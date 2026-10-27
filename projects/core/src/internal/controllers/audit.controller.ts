// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { GlobalStateService } from '../services/global.service.js';
import { LogService } from '../services/log.service.js';
import { auditParentElement } from '../utils/audit.js';
import {
  getExcessiveInstanceLimitWarning,
  getInvalidParentWarning,
  getMultiplePageWarning
} from '../utils/audit-logs.js';

export const excessiveInstanceLimit = 50;

export interface AuditOptions {
  excessiveInstanceLimit?: number;
  alternates?: { name: string; use: string }[];
}

export interface AuditMetadata {
  parents?: string[];
}

interface AuditRegistry {
  [key: string]: {
    count?: number;
    excessiveInstanceLimitAudited?: boolean;
  };
}

export function audit<T extends Audit>(options: AuditOptions = {}): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new AuditController(instance, options));
}

export type Audit = ReactiveElement;

export class AuditController<T extends Audit> implements ReactiveController {
  #counted = false;

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
    if (!this.#production) this.#auditExcessiveInstanceLimit();
    await this.host.updateComplete;
    if (!this.#production && this.host.isConnected) {
      this.#auditParentElement();
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

  #auditExcessiveInstanceLimit() {
    const limit = this.options.excessiveInstanceLimit;
    if (limit === undefined || this.#counted) return;

    this.#counted = true;
    const count = (this.#hostAuditState.count ?? 0) + 1;
    const audited = this.#hostAuditState.excessiveInstanceLimitAudited ?? false;
    const shouldWarn = count > limit && !audited;
    this.#update({ [this.host.localName]: { count, excessiveInstanceLimitAudited: audited || shouldWarn } });

    if (shouldWarn && this.#counted) {
      LogService.warn(
        this.host.localName === 'nve-page'
          ? getMultiplePageWarning(count)
          : getExcessiveInstanceLimitWarning(count, this.host.localName)
      );
    }
  }

  #cleanupExcessiveInstanceLimit() {
    const limit = this.options.excessiveInstanceLimit;
    if (limit === undefined || !this.#counted) return;

    this.#counted = false;
    const count = Math.max(0, (this.#hostAuditState.count ?? 0) - 1);
    this.#update({
      [this.host.localName]: {
        count,
        excessiveInstanceLimitAudited: count > limit && this.#hostAuditState.excessiveInstanceLimitAudited
      }
    });
  }

  #update(registry: AuditRegistry) {
    GlobalStateService.dispatch('NVE_ELEMENTS_AUDIT_UPDATE', { audit: registry } as Partial<
      typeof globalThis.NVE_ELEMENTS.state
    >);
  }

  #auditParentElement() {
    if (this.#hostMetadata.parents) {
      const [valid, validParents] = auditParentElement(this.host);
      if (!valid) {
        LogService.warn(getInvalidParentWarning(this.host.localName, validParents.join(', ')));
      }
    }
  }
}

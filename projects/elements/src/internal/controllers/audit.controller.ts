import type { ReactiveController, ReactiveElement } from 'lit';
import { GlobalStateService } from '../services/global.service.js';
import { LogService } from '../services/log.service.js';
import { auditSlots, getInvalidSlotsWarning, getExcessiveInstanceLimitWarning } from '../utils/audit.js';

export const excessiveInstanceLimit = 50;

export interface AuditOptions {
  excessiveInstanceLimit?: number;
  auditSlots?: boolean;
}

interface AuditRegistry {
  [key: string]: {
    count?: number;
    excessiveInstanceLimitAudited?: boolean;
  };
}

export function audit<T extends Audit>(options: AuditOptions): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new AuditController(instance, options));
}

export type Audit = ReactiveElement;

export class AuditController<T extends Audit> implements ReactiveController {
  get #hostAuditState() {
    return GlobalStateService.state.audit[this.host.localName] ?? { count: 0 };
  }

  get #production() {
    return GlobalStateService.state.env === 'production';
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
      this.#auditSlots();
      this.#auditExcessiveInstanceLimit();
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
    if (this.options.excessiveInstanceLimit !== undefined) {
      if (
        this.#hostAuditState.count > this.options.excessiveInstanceLimit &&
        !this.#hostAuditState.excessiveInstanceLimitAudited
      ) {
        LogService.warn(getExcessiveInstanceLimitWarning(this.#hostAuditState.count, this.host.localName));
        this.#update({
          [this.host.localName]: { count: this.#hostAuditState.count + 1, excessiveInstanceLimitAudited: true }
        });
      } else {
        this.#update({ [this.host.localName]: { count: this.#hostAuditState.count + 1 } });
      }
    }
  }

  #cleanupExcessiveInstanceLimit() {
    if (this.options.excessiveInstanceLimit) {
      this.#update({
        [this.host.localName]: { count: this.#hostAuditState.count - 1, excessiveInstanceLimitAudited: false }
      });
    }
  }

  #auditSlots() {
    if (this.options.auditSlots) {
      const [invalidElements, validElements] = auditSlots(this.host);
      if (invalidElements.length) {
        LogService.warn(getInvalidSlotsWarning(this.host.localName, validElements));
      }
    }
  }

  #update(audit: Partial<AuditRegistry>) {
    GlobalStateService.dispatch('NVE_ELEMENTS_AUDIT_UPDATE', { audit });
  }
}

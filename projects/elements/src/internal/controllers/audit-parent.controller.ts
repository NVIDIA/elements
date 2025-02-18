import type { ReactiveController, ReactiveElement } from 'lit';
import { GlobalStateService } from '../services/global.service.js';
import { LogService } from '../services/log.service.js';
import { auditParentElement, getInvalidParentWarning } from '../utils/audit.js';

/** Determines if element is assigned to valid parent element */
export function auditParent<T extends AuditParent>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new AuditParentController(instance));
}

export type AuditParent = ReactiveElement;

export class AuditParentController<T extends AuditParent> implements ReactiveController {
  get #production() {
    return GlobalStateService.state.env === 'production';
  }

  constructor(private host: T) {
    if (!this.#production) {
      this.host.addController(this);
    }
  }

  async hostConnected() {
    await this.host.updateComplete;
    if (!this.#production) {
      this.#auditParentElement();
    }
  }

  #auditParentElement() {
    const [valid, validParent] = auditParentElement(this.host);
    if (!valid) {
      LogService.warn(getInvalidParentWarning(this.host.localName, validParent));
    }
  }
}

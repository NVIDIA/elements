import { ReactiveController, ReactiveElement  } from 'lit';

/**
 * Adds anchor/link support for interactive custom elements.
 */
export function typeAnchor<T extends Anchor>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new TypeAnchorController(instance));
}

export interface Anchor extends ReactiveElement { disabled: boolean; readonly: boolean; }

export class TypeAnchorController<T extends Anchor> implements ReactiveController {
  get #anchor() {
    return this.host.querySelector<HTMLAnchorElement>('a');
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;

    if (this.#anchor) {
      this.host.readonly = true;
    }

    this.#anchor?.addEventListener('click', e => {
      if (this.host.disabled) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
  }
}

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { getFlatDOMTree } from '../utils/dom.js';

/**
 * Adds Invoker Commands API support for interactive custom elements.
 * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
 */
export function typeCommand<T extends Command>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => target.addInitializer((instance: T) => new TypeCommandController(instance));
}

export type Command = ReactiveElement &
  HTMLElement & {
    command: string;
    commandFor: string;
    readonly: boolean;
    disabled: boolean;
  };

export class TypeCommandController<T extends Command> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#updateListener();
  }

  #updateListener() {
    if (!this.host.readonly && !this.host.disabled) {
      this.host.addEventListener('click', this.#triggerCommandFn);
    } else {
      this.host.removeEventListener('click', this.#triggerCommandFn);
    }
  }

  #triggerCommandFn = this.#triggerCommand.bind(this);
  #triggerCommand() {
    if (this.host.commandFor && globalThis.CommandEvent) {
      const match = getFlatDOMTree(this.host.getRootNode() as HTMLElement).find(el => el.id === this.host.commandFor);
      if (!match) {
        console.warn('commandFor', this.host.commandFor, 'not found');
      } else {
        match.dispatchEvent(new globalThis.CommandEvent('command', { command: this.host.command, source: this.host }));
      }
    }
  }
}

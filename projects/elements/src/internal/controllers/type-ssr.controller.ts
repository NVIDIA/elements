import type { ReactiveController, ReactiveElement } from 'lit';
import { render } from 'lit';
import { LogService } from '../services/log.service.js';
import { getSSRMismatchWarning } from '../utils/audit.js';

/**
 * Catch and manage hydration related fallbacks for SSR
 */
export function typeSSR<T extends ReactiveElement>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new TypeSSRController(instance));
}

export class TypeSSRController<T extends ReactiveElement> implements ReactiveController {
  // https://www.konnorrogers.com/posts/2024/running-lit-ssr-in-web-awesome#hydration-errors
  didSSR = Boolean(this.host.shadowRoot);

  constructor(private host: T) {
    this.host.addController(this);

    // https://github.com/lit/lit/issues/1434#issuecomment-1598332000
    if (this.didSSR) {
      const updateOriginal = (host as any).update;
      Object.defineProperty(host as any, 'update', {
        value: function (...args: any) {
          try {
            (updateOriginal as any).call(host, args);
          } catch (e) {
            console.log(e);
            LogService.warn(getSSRMismatchWarning(host.localName));
            (host.renderRoot as any).innerHTML = (host.renderRoot as any).innerHTML.split('<!--lit-part ')[0];
            render((host as any).render(), host.renderRoot, (host as any).renderOptions);
            host.requestUpdate();
          }
          return updateOriginal;
        }
      });
    }
  }

  // https://github.com/lit/lit/discussions/4697
  // https://github.com/w3c/csswg-drafts/issues/6867#issuecomment-1599444407
  #firstUpdate = true;
  hostUpdated() {
    if (this.didSSR && this.#firstUpdate) {
      this.#firstUpdate = false;
      this.host.shadowRoot?.querySelectorAll('slot').forEach(slotElement => {
        slotElement.dispatchEvent(new Event('slotchange', { bubbles: true, composed: false, cancelable: false }));
      });
    }
  }
}

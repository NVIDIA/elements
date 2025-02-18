import type { ReactiveController, ReactiveElement, RenderOptions, TemplateResult } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { render } from 'lit';
import { LogService } from '../services/log.service.js';
import { getSSRMismatchWarning } from '../utils/audit.js';

type UnprotectedLitElement = ReactiveElement & {
  update: () => void;
  render: () => TemplateResult;
  renderOptions: RenderOptions;
};

/**
 * Catch and manage hydration related fallbacks for SSR
 */
export function typeSSR<T extends UnprotectedLitElement>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => target.addInitializer((instance: T) => new TypeSSRController(instance));
}

export class TypeSSRController<T extends ReactiveElement> implements ReactiveController {
  // https://www.konnorrogers.com/posts/2024/running-lit-ssr-in-web-awesome#hydration-errors
  didSSR = Boolean(this.host.shadowRoot);

  constructor(private host: T & UnprotectedLitElement) {
    this.host.addController(this);

    // https://github.com/lit/lit/issues/1434#issuecomment-1598332000
    if (this.didSSR) {
      const updateOriginal = host.update;
      Object.defineProperty(host, 'update', {
        value: function (...args) {
          try {
            updateOriginal.call(host, args);
          } catch (e) {
            console.log(e);
            LogService.warn(getSSRMismatchWarning(host.localName));
            (host.renderRoot as HTMLElement).innerHTML = (host.renderRoot as HTMLElement).innerHTML.split(
              '<!--lit-part '
            )[0];
            render(host.render(), host.renderRoot, host.renderOptions);
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

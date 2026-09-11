// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, html, type PropertyValues } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './iframe.css?inline';

type ResizeMessage = {
  resize: true;
  width: number;
  height: number;
};

type ThemeMessage = {
  theme: string;
};

function isResizeMessage(value: unknown): value is ResizeMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'resize' in value &&
    value.resize === true &&
    'width' in value &&
    typeof value.width === 'number' &&
    'height' in value &&
    typeof value.height === 'number'
  );
}

const iframeScript = /* html */ `
  <script type="module">
    window.addEventListener('message', event => {
      if (event.source !== window.parent || typeof event.data !== 'string') {
        return;
      }

      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (typeof message !== 'object' || message === null || typeof message.theme !== 'string') {
        return;
      }

      document.documentElement.setAttribute('nve-theme', message.theme);
      document.documentElement.style.colorScheme = message.theme;
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === document.body) {
          const size = { resize: true, width: entry.borderBoxSize[0].inlineSize, height: entry.borderBoxSize[0].blockSize };
          window.parent.postMessage(JSON.stringify(size), '*');
        }
      }
    });
    resizeObserver.observe(document.body);
  </script>
`;

/**
 * @element nve-iframe
 * @description An iframe component that syncs with the parent document's theme and template content. Use when needing to render dynamically generated or isolated content.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/code/iframe
 * @documentation https://nvidia.github.io/elements/docs/code/iframe/
 * @slot - A template containing the iframe body content.
 * @slot head - A template containing content inserted into the iframe head.
 * @cssprop --border
 * @cssprop --width
 * @cssprop --height
 * @beta
 */
export class Iframe extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-iframe',
    version: '0.0.0'
  };

  get #template() {
    return this.querySelector<HTMLTemplateElement>('template:not([slot])');
  }

  get #headTemplate() {
    return this.querySelector<HTMLTemplateElement>('template[slot="head"]');
  }

  get #iframe() {
    return this.shadowRoot?.querySelector<HTMLIFrameElement>('iframe') ?? null;
  }

  get #themeHost() {
    return globalThis.document.querySelector<HTMLElement>('[nve-theme]');
  }

  #templateObserver?: MutationObserver;
  #headTemplateObserver?: MutationObserver;
  #themeObserver?: MutationObserver;

  render() {
    return html`<iframe
      internal-host
      title=${this.ariaLabel}
      sandbox="allow-scripts"
      @load=${this.#syncTheme}
    ></iframe>`;
  }

  connectedCallback() {
    super.connectedCallback();
    globalThis.window.addEventListener('message', this.#handleResizeMessage);
    if (this.hasUpdated) {
      this.#setupTemplateUpdates();
      this.#setupTemplateHeadUpdates();
      this.#setupThemeUpdates();
      this.#updateSource();
    }
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.#setupTemplateUpdates();
    this.#setupTemplateHeadUpdates();
    this.#setupThemeUpdates();
    this.#updateSource();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#templateObserver?.disconnect();
    this.#headTemplateObserver?.disconnect();
    this.#themeObserver?.disconnect();
    this.#templateObserver = undefined;
    this.#headTemplateObserver = undefined;
    this.#themeObserver = undefined;
    globalThis.window.removeEventListener('message', this.#handleResizeMessage);
  }

  // <head> and <body> can't be slotted https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template#usage_notes
  #updateSource() {
    const iframe = this.#iframe;
    if (iframe === null) {
      return;
    }

    const theme = this.#themeHost?.getAttribute('nve-theme') ?? '';
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html nve-theme="${theme}" style="color-scheme: ${theme}">
      <head>
        <style>
          html { box-sizing: border-box; }
          *, *:before, *:after { box-sizing: inherit; }
          html, body { margin: 0; overflow: hidden; }
          html { height: 100vh; width: 100vw; }
        </style>
        ${this.#headTemplate?.innerHTML ?? ''}
      </head>
      <body nve-text="body">
        ${this.#template?.innerHTML ?? ''}
        ${iframeScript}
      </body>
      </html>
    `;
  }

  #setupTemplateUpdates() {
    if (this.#template && !this.#templateObserver) {
      this.#templateObserver = new MutationObserver(() => this.#updateSource());
      this.#templateObserver.observe(this.#template.content, { childList: true, subtree: true, characterData: true });
    }
  }

  #setupTemplateHeadUpdates() {
    if (this.#headTemplate && !this.#headTemplateObserver) {
      this.#headTemplateObserver = new MutationObserver(() => this.#updateSource());
      this.#headTemplateObserver.observe(this.#headTemplate.content, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  #setupThemeUpdates() {
    const themeHost = this.#themeHost;
    if (themeHost && !this.#themeObserver) {
      this.#themeObserver = new MutationObserver(() => this.#syncTheme());
      this.#themeObserver.observe(themeHost, { attributeFilter: ['nve-theme'] });
    }
  }

  #syncTheme = () => {
    const theme = this.#themeHost?.getAttribute('nve-theme');
    const contentWindow = this.#iframe?.contentWindow;
    if (theme === null || theme === undefined || contentWindow === null || contentWindow === undefined) {
      return;
    }

    const message: ThemeMessage = { theme };
    // Sandboxed srcdoc documents have opaque origins, so authenticate messages by their window reference.
    contentWindow.postMessage(JSON.stringify(message), '*');
  };

  #handleResizeMessage = (event: MessageEvent<unknown>) => {
    const iframe = this.#iframe;
    if (iframe === null || event.source !== iframe.contentWindow || typeof event.data !== 'string') {
      return;
    }

    let message: unknown;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    if (!isResizeMessage(message)) {
      return;
    }

    this.style.setProperty('--_width', `${message.width}px`);
    this.style.setProperty('--_height', `${message.height}px`);
  };
}

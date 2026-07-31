// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { Iframe } from '@nvidia-elements/core/iframe';
import '@nvidia-elements/core/iframe/define.js';

type AppliedThemeMessage = {
  appliedTheme: {
    theme: string;
    colorScheme: string;
  };
};

function isAppliedThemeMessage(value: unknown): value is AppliedThemeMessage {
  if (typeof value !== 'object' || value === null || !('appliedTheme' in value)) {
    return false;
  }

  const appliedTheme = value.appliedTheme;
  return (
    typeof appliedTheme === 'object' &&
    appliedTheme !== null &&
    'theme' in appliedTheme &&
    typeof appliedTheme.theme === 'string' &&
    'colorScheme' in appliedTheme &&
    typeof appliedTheme.colorScheme === 'string'
  );
}

describe(Iframe.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Iframe;
  let iframe: HTMLIFrameElement;
  let initialTheme: string | null;

  function getDocumentId() {
    const match = iframe.srcdoc.match(/documentId: (\d+)/);
    if (!match) {
      throw new Error('Expected the iframe resize message document ID.');
    }
    return Number(match[1]);
  }

  async function loadResizableContent(sizing: 'automatic' | 'fallback' | 'blocked') {
    const head = element.querySelector<HTMLTemplateElement>('template[slot="head"]');
    const body = element.querySelector<HTMLTemplateElement>('template:not([slot])');
    if (!head || !body) {
      throw new Error('Expected the iframe templates.');
    }

    const loaded = untilEvent(iframe, 'load');
    head.innerHTML = `<title>Resizable iframe</title>${
      sizing === 'fallback'
        ? '<script>Object.defineProperty(window, "requestResize", { value: undefined });<\/script>'
        : sizing === 'blocked'
          ? '<script>Object.defineProperty(window, "requestResize", { value: () => { throw new DOMException("Resize denied", "NotAllowedError"); } });<\/script>'
          : ''
    }`;
    body.innerHTML = `<div style="height: 80px"></div>
      <script>
        window.addEventListener('message', event => {
          if (event.source === window.parent && typeof event.data === 'number') {
            document.querySelector('div').style.height = event.data + 'px';
          }
        });
      <\/script>`;
    await loaded;
  }

  beforeEach(async () => {
    initialTheme = globalThis.document.documentElement.getAttribute('nve-theme');
    fixture = await createFixture(html`
      <nve-iframe>
        <template slot="head"><title>Iframe unit test</title></template>
        <template><main nve-text="body">Initial body content</main></template>
      </nve-iframe>
    `);
    const iframeComponent = fixture.querySelector<Iframe>(Iframe.metadata.tag);
    if (!iframeComponent) {
      throw new Error('Expected the iframe fixture to render.');
    }
    element = iframeComponent;
    await elementIsStable(element);
    iframe = element.shadowRoot?.querySelector<HTMLIFrameElement>('iframe') as HTMLIFrameElement;
  });

  afterEach(() => {
    removeFixture(fixture);
    if (initialTheme === null) {
      globalThis.document.documentElement.removeAttribute('nve-theme');
    } else {
      globalThis.document.documentElement.setAttribute('nve-theme', initialTheme);
    }
  });

  it('should define element', () => {
    expect(customElements.get(Iframe.metadata.tag)).toBeDefined();
  });

  it('should render an accessible sandboxed iframe', async () => {
    element.ariaLabel = 'Iframe unit test';
    element.requestUpdate();
    await elementIsStable(element);
    expect(iframe.hasAttribute('internal-host')).toBe(true);
    expect(iframe.title).toBe('Iframe unit test');
    expect(iframe.sandbox.contains('allow-scripts')).toBe(true);
    expect(iframe.sandbox.contains('allow-same-origin')).toBe(false);
  });

  it('should generate srcdoc from the head and body templates', () => {
    expect(iframe.srcdoc).toContain('<title>Iframe unit test</title>');
    expect(iframe.srcdoc).toContain('<main nve-text="body">Initial body content</main>');
    expect(iframe.srcdoc).toContain('event.source !== window.parent');
    expect(iframe.srcdoc).toContain("window.parent.postMessage(JSON.stringify(size), '*')");
    expect(iframe.srcdoc).toContain('new ResizeObserver');
    expect(iframe.srcdoc).toContain('<meta name="responsive-embedded-sizing" content="allow-origins=*">');
  });

  it('should generate srcdoc without templates or a theme host', async () => {
    globalThis.document.documentElement.removeAttribute('nve-theme');
    const emptyIframe = globalThis.document.createElement(Iframe.metadata.tag);
    fixture.append(emptyIframe);
    await elementIsStable(emptyIframe);

    const innerIframe = emptyIframe.shadowRoot?.querySelector<HTMLIFrameElement>('iframe');
    const emptySrcdoc = innerIframe?.srcdoc;
    expect(emptySrcdoc).toContain('<html nve-theme="" style="color-scheme: ">');
    expect(emptySrcdoc).toContain('<body');
  });

  it('should refresh srcdoc when body template content changes', async () => {
    const template = element.querySelector<HTMLTemplateElement>('template:not([slot])') as HTMLTemplateElement;
    template.innerHTML = '<main nve-text="body">Updated body content</main>';

    await vi.waitFor(() => {
      expect(iframe.srcdoc).toContain('Updated body content');
    });
  });

  it('should refresh srcdoc when head template content changes', async () => {
    const template = element.querySelector<HTMLTemplateElement>('template[slot="head"]') as HTMLTemplateElement;
    template.innerHTML = '<title>Updated iframe title</title>';

    await vi.waitFor(() => {
      expect(iframe.srcdoc).toContain('<title>Updated iframe title</title>');
    });
  });

  it('should refresh srcdoc when the body template is replaced', async () => {
    const template = element.querySelector<HTMLTemplateElement>('template:not([slot])') as HTMLTemplateElement;
    const replacement = globalThis.document.createElement('template');
    replacement.innerHTML = '<main>Replacement body content</main>';
    template.replaceWith(replacement);

    await vi.waitFor(() => {
      expect(iframe.srcdoc).toContain('Replacement body content');
    });

    replacement.innerHTML = '<main>Updated replacement body content</main>';
    await vi.waitFor(() => {
      expect(iframe.srcdoc).toContain('Updated replacement body content');
    });
  });

  it('should refresh srcdoc when the head template is replaced', async () => {
    const template = element.querySelector<HTMLTemplateElement>('template[slot="head"]') as HTMLTemplateElement;
    const replacement = globalThis.document.createElement('template');
    replacement.slot = 'head';
    replacement.innerHTML = '<title>Replacement iframe title</title>';
    template.replaceWith(replacement);

    await vi.waitFor(() => {
      expect(iframe.srcdoc).toContain('<title>Replacement iframe title</title>');
    });

    replacement.innerHTML = '<title>Updated replacement iframe title</title>';
    await vi.waitFor(() => {
      expect(iframe.srcdoc).toContain('<title>Updated replacement iframe title</title>');
    });
  });

  it('should propagate theme changes into the sandboxed iframe', async () => {
    const nextTheme = initialTheme === 'light' ? 'dark' : 'light';
    let appliedTheme: { theme: string; colorScheme: string } | undefined;
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== iframe.contentWindow || typeof event.data !== 'string') {
        return;
      }

      let message: unknown;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (isAppliedThemeMessage(message)) {
        appliedTheme = message.appliedTheme;
      }
    };
    globalThis.window.addEventListener('message', handleMessage);

    try {
      const loaded = untilEvent(iframe, 'load');
      const template = element.querySelector<HTMLTemplateElement>('template:not([slot])') as HTMLTemplateElement;
      template.innerHTML = `<script>
        window.addEventListener('message', event => {
          if (event.source !== window.parent || typeof event.data !== 'string') return;
          let message;
          try {
            message = JSON.parse(event.data);
          } catch {
            return;
          }
          if (typeof message !== 'object' || message === null || typeof message.theme !== 'string') return;
          setTimeout(() => {
            const appliedTheme = {
              theme: document.documentElement.getAttribute('nve-theme'),
              colorScheme: document.documentElement.style.colorScheme
            };
            window.parent.postMessage(JSON.stringify({ appliedTheme }), '*');
          }, 0);
        });
      <\/script>`;
      await loaded;

      globalThis.document.documentElement.setAttribute('nve-theme', nextTheme);
      await vi.waitFor(() => expect(appliedTheme).toEqual({ theme: nextTheme, colorScheme: nextTheme }));
    } finally {
      globalThis.window.removeEventListener('message', handleMessage);
    }
  });

  it('should isolate iframe content from the parent origin', async () => {
    await vi.waitFor(() => {
      expect(iframe.contentDocument).toBeNull();
    });
  });

  it('should receive resize messages from the sandboxed iframe', async () => {
    await vi.waitFor(() => {
      expect(element.style.getPropertyValue('--_width')).toMatch(/^\d+(?:\.\d+)?px$/);
      expect(element.style.getPropertyValue('--_height')).toMatch(/^(?:auto|\d+(?:\.\d+)?px)$/);
    });
  });

  it.each(['automatic', 'fallback', 'blocked'] as const)(
    'should grow and shrink with %s height sizing',
    async sizing => {
      await loadResizableContent(sizing);
      await vi.waitFor(() => expect(iframe.getBoundingClientRect().height).toBe(80));

      iframe.contentWindow?.postMessage(240, '*');
      await vi.waitFor(() => expect(iframe.getBoundingClientRect().height).toBe(240));

      iframe.contentWindow?.postMessage(40, '*');
      await vi.waitFor(() => expect(iframe.getBoundingClientRect().height).toBe(40));
      expect(sizing === 'automatic' ? ['auto', '40px'] : ['40px']).toContain(
        element.style.getPropertyValue('--_height')
      );
    }
  );

  it.each(['automatic', 'fallback', 'blocked'] as const)(
    'should preserve dimension overrides with %s height sizing',
    async sizing => {
      element.style.setProperty('--width', '256px');
      element.style.setProperty('--height', '128px');
      await loadResizableContent(sizing);
      await vi.waitFor(() => expect(element.style.getPropertyValue('--_width')).toBe('256px'));

      iframe.contentWindow?.postMessage(240, '*');
      await vi.waitFor(() => {
        expect(iframe.getBoundingClientRect().width).toBe(256);
        expect(iframe.getBoundingClientRect().height).toBe(128);
        expect(sizing === 'automatic' ? ['auto', '240px'] : ['240px']).toContain(
          element.style.getPropertyValue('--_height')
        );
      });

      element.style.removeProperty('--height');
      await vi.waitFor(() => expect(iframe.getBoundingClientRect().height).toBe(240));
    }
  );

  it('should replace fallback height when the next document uses native sizing', async () => {
    await loadResizableContent('fallback');
    await vi.waitFor(() => expect(element.style.getPropertyValue('--_height')).toBe('80px'));

    await loadResizableContent('automatic');
    await vi.waitFor(() => {
      expect(iframe.getBoundingClientRect().height).toBe(80);
      expect(['auto', '80px']).toContain(element.style.getPropertyValue('--_height'));
    });

    iframe.contentWindow?.postMessage(40, '*');
    await vi.waitFor(() => expect(iframe.getBoundingClientRect().height).toBe(40));
  });

  it('should size the iframe from valid resize messages', () => {
    const source = iframe.contentWindow;
    if (!source) {
      throw new Error('Expected the iframe to have a content window.');
    }

    globalThis.window.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify({ resize: true, documentId: getDocumentId(), width: 320, height: 180 }),
        source
      })
    );

    expect(element.style.getPropertyValue('--_width')).toBe('320px');
    expect(element.style.getPropertyValue('--_height')).toBe('180px');
  });

  it('should ignore malformed and unrelated resize messages', () => {
    const source = iframe.contentWindow;
    if (!source) {
      throw new Error('Expected the iframe to have a content window.');
    }

    const documentId = getDocumentId();
    const messages: MessageEventInit<unknown>[] = [
      { data: JSON.stringify({ documentId, resize: true, width: 320, height: 180 }), source: globalThis.window },
      { data: { documentId, resize: true, width: 320, height: 180 }, source },
      { data: 'not-json', source },
      { data: 'null', source },
      { data: JSON.stringify({ documentId, resize: false, width: 320, height: 180 }), source },
      { data: JSON.stringify({ documentId, resize: true, width: '320', height: 180 }), source },
      { data: JSON.stringify({ documentId, resize: true, width: 320, height: null }), source },
      { data: JSON.stringify({ documentId, resize: true, width: 320, height: '180' }), source },
      { data: JSON.stringify({ resize: true, documentId: documentId - 1, width: 320, height: 180 }), source },
      { data: JSON.stringify({ resize: true, documentId: 'invalid', width: 320, height: 180 }), source }
    ];

    messages.forEach(init => globalThis.window.dispatchEvent(new MessageEvent('message', init)));

    expect(element.style.getPropertyValue('--_width')).toBe('');
    expect(element.style.getPropertyValue('--_height')).toBe('0px');
  });

  it('should restore observers when reconnected', async () => {
    element.remove();
    fixture.append(element);
    await elementIsStable(element);

    const template = element.querySelector<HTMLTemplateElement>('template:not([slot])') as HTMLTemplateElement;
    template.innerHTML = '<main nve-text="body">Reconnected content</main>';

    await vi.waitFor(() => {
      expect(iframe.srcdoc).toContain('Reconnected content');
    });
  });

  it('should remove the message listener when disconnected', () => {
    const removeEventListener = vi.spyOn(globalThis.window, 'removeEventListener');
    element.remove();
    expect(removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    removeEventListener.mockRestore();
  });
});

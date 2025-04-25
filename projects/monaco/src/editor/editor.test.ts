import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { html } from 'lit';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@nvidia-elements/testing';
import { MonacoEditor } from '@nvidia-elements/monaco/editor';
import '@nvidia-elements/monaco/editor/define.js';
import { toggleThemeForColorScheme } from '../themes/index.js';

vi.mock('../themes/index.js', () => {
  return {
    defineThemes: vi.fn(),
    applyThemeForColorScheme: vi.fn(),
    toggleThemeForColorScheme: vi.fn()
  };
});

const mockToggleTheme = vi.mocked(toggleThemeForColorScheme);

describe('nve-monaco-editor', () => {
  let fixture: HTMLElement;
  let element: MonacoEditor;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-monaco-editor></nve-monaco-editor>
    `);
    element = fixture.querySelector(MonacoEditor.metadata.tag) as MonacoEditor;
    await untilEvent(element, 'ready');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.clearAllMocks();
  });

  it('should define element', async () => {
    expect(customElements.get(MonacoEditor.metadata.tag)).toBeDefined();
  });

  it('should instantiate editor', async () => {
    expect(element.shadowRoot.querySelector('#editor')).toBeDefined();
    expect(element.shadowRoot.querySelector('.monaco-editor')).toBeDefined();
  });

  it('should provide access to the Monaco Editor API instance', async () => {
    expect(element.monaco).toBeDefined();
  });

  it('should provide access to the Monaco Editor instance', async () => {
    expect(element.editor).toBeDefined();
  });

  it('should gracefully handle connect/disconnect during initialization', async () => {
    const { parentElement } = element;

    element.remove();

    const canceledEvent = untilEvent(element, 'canceled');
    parentElement.appendChild(element);
    element.remove();
    await canceledEvent;

    const readyEvent = untilEvent(element, 'ready');
    parentElement.appendChild(element);
    await readyEvent;
  });

  it('should stop internal DOM input and change events from leaking out', async () => {
    const inputSpy = vi.fn();
    const changeSpy = vi.fn();

    document.addEventListener('input', inputSpy);
    document.addEventListener('change', changeSpy);

    const editor = element.shadowRoot.querySelector('#editor');
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));

    expect(inputSpy).not.toHaveBeenCalled();
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('should not re-insert editor styles when reconnected to DOM', async () => {
    const initialStyleSheets = element.shadowRoot.adoptedStyleSheets.length;

    fixture.removeChild(element);
    await elementIsStable(element);

    fixture.appendChild(element);
    await untilEvent(element, 'ready');
    await elementIsStable(element);

    expect(element.shadowRoot.adoptedStyleSheets.length).toBe(initialStyleSheets);
  });

  it('should toggle theme when color scheme probe transitions', async () => {
    const probe = element.shadowRoot.querySelector('#color-scheme-probe');
    probe.dispatchEvent(new Event('transitionrun', { bubbles: true }));

    expect(mockToggleTheme).toHaveBeenCalledWith(element.monaco, element);
  });
});

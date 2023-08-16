import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@elements/elements/test';
import { JSONViewer } from '@elements/elements/json-viewer';
import '@elements/elements/json-viewer/define.js';

describe('nve-json-viewer', () => {
  let fixture: HTMLElement;
  let element: JSONViewer;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-json-viewer>
        { "list": [1, 2, 3], "object": { "a": 1, "b": 2, "c": { "value": 3 } } }
      </nve-json-viewer>
    `);
    element = fixture.querySelector('nve-json-viewer');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-json-viewer')).toBeDefined();
  });

  it('should render JSON via slot', async () => {
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('nve-json-node').length).toBe(2);
  });

  it('should show top level nodes when expanded', async () => {
    element.expanded = true;
    await elementIsStable(element);
    const [nodeOne, nodeTwo] = Array.from(element.shadowRoot.querySelectorAll('nve-json-node'));
    expect(nodeOne.expanded).toBe(true);
    expect(nodeTwo.expanded).toBe(true);
  });

  it('should show expand all nodes when expanded-all', async () => {
    element.expandedAll = true;
    await elementIsStable(element);

    const node = Array.from(element.shadowRoot.querySelectorAll('nve-json-node'))[1];
    node.expanded = true;

    await elementIsStable(node);
    const deepNodes = Array.from(node.shadowRoot.querySelectorAll('nve-json-node'));

    expect(deepNodes.length).toBe(3);
  });

  it('should render object styles if root value is object', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('.object')).toBeTruthy();
  });

  it('should render array styles if root value is array', async () => {
    element.value = [1, 2, 3];
    await elementIsStable(element);
    expect(element.shadowRoot.querySelectorAll('.array')).toBeTruthy();
  });
});

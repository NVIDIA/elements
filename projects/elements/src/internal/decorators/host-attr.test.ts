import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hostAttr } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';

@customElement('host-attr-test-element')
class HostAttrTestElement extends LitElement {
  @hostAttr() slot = 'test';

  render() {
    return html` `;
  }
}

describe('host-attr decorator', () => {
  let element: HostAttrTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<host-attr-test-element></host-attr-test-element>`);
    element = fixture.querySelector<HostAttrTestElement>('host-attr-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should apply a host attribute to element', async () => {
    await elementIsStable(element);

    expect(element.slot).toBe('test');
  });
});

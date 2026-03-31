import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';
import { Button } from '@nvidia-elements/core/button';
import '@nvidia-elements/core/button/define.js';

describe(Button.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Button;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-button>hello there</nve-button>`);
    element = fixture.querySelector(Button.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Button.metadata.tag)).toBeDefined();
  });

  it('should initialize tabindex 0 for focus behavior', async () => {
    await elementIsStable(element);
    expect(element.tabIndex).toBe(0);
  });

  it('should initialize role button', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('button');
  });

  it('should remove tabindex if disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
  });

  it('should reflect a interaction value', async () => {
    expect(element.interaction).toBe(undefined);
    expect(element.hasAttribute('interaction')).toBe(false);

    element.interaction = 'emphasis';
    await elementIsStable(element);
    expect(element.getAttribute('interaction')).toBe('emphasis');
  });

  it('should reflect a container value', async () => {
    expect(element.container).toBe(undefined);
    expect(element.hasAttribute('container')).toBe(false);

    element.container = 'inline';
    await elementIsStable(element);
    expect(element.getAttribute('container')).toBe('inline');
  });

  it('should reflect a size value', async () => {
    expect(element.size).toBe(undefined);
    expect(element.hasAttribute('size')).toBe(false);

    element.size = 'sm';
    await elementIsStable(element);
    expect(element.getAttribute('size')).toBe('sm');
  });
});

describe(`${Button.metadata.tag} - submit`, () => {
  let fixture;
  afterEach(() => {
    removeFixture(fixture);
  });

  it('should submit the form when clicked', async () => {
    fixture = await createFixture(html`
      <form method="post" action=".">
        <nve-button type="submit">Submit</nve-button>
      </form>
    `);
    const element = fixture.querySelector(Button.metadata.tag);
    await elementIsStable(element);

    let called = false;
    fixture.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      called = true;
    });

    emulateClick(element);

    expect(called).toBe(true);
  });

  it('should not submit the form when disabled', async () => {
    fixture = await createFixture(html`
      <form method="post" action=".">
        <nve-button type="submit" disabled>Submit</nve-button>
      </form>
    `);
    const element = fixture.querySelector(Button.metadata.tag);
    await elementIsStable(element);

    let called = false;
    fixture.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      called = true;
    });

    emulateClick(element);

    expect(called).toBe(false);
  });
});

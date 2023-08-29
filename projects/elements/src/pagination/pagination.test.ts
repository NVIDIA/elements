import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@elements/elements/test';
import type { IconButton } from '@elements/elements/icon-button';
import { Pagination } from '@elements/elements/pagination';
import '@elements/elements/pagination/define.js';

describe('nve-pagination', () => {
  let fixture: HTMLElement;
  let element: Pagination;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-pagination name="page" .value=${1} .step=${10} .items=${100}></nve-pagination>
      </form>
    `);
    element = fixture.querySelector('nve-pagination');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-pagination')).toBeDefined();
  });

  it('should have a role of toolbar', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('toolbar');
  });

  it('should set the select label', async () => {
    expect(element.shadowRoot.querySelector('.select-label').textContent).toBe('1-10');

    element.value = 5;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.select-label').textContent).toBe('40-50');
  });

  it('should number format items label', async () => {
    expect(element.shadowRoot.querySelector('label').textContent).toBe('of 100');
    element.items = 10_000;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('label').textContent).toBe('of 10,000');
  });

  it('should apply aria labels to buttons and select', async () => {
    element.skippable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<HTMLSelectElement>('select').ariaLabel).toBe('current page');
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="left"]').ariaLabel).toBe('previous');
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="right"]').ariaLabel).toBe('next');
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="left"]').ariaLabel).toBe('start');
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="right"]').ariaLabel).toBe('end');
  });

  it('should disable previous and start buttons if at start of pages', async () => {
    element.skippable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="left"]').disabled).toBe(true);
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="left"]').disabled).toBe(true);
  });

  it('should disable next and end buttons if at end of pages', async () => {
    element.skippable = true;
    element.value = 10;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.select-label').textContent).toBe('90-100');
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="right"]').disabled).toBe(true);
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="right"]').disabled).toBe(true);
  });

  it('should emit the next page when clicking the next and previous button', async () => {
    await elementIsStable(element);
    const nextEvent = untilEvent(element, 'change');
    emulateClick(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="right"]'));
    await nextEvent;
    expect(element.value).toBe(2);

    await elementIsStable(element);
    const previousEvent = untilEvent(element, 'change');
    emulateClick(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="left"]'));
    await previousEvent;
    expect(element.value).toBe(1);
  });

  it('should emit the next page when clicking the start and end button', async () => {
    element.skippable = true;
    await elementIsStable(element);
    const startEvent = untilEvent(element, 'change');
    emulateClick(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="right"]'));
    await startEvent;
    expect(element.step).toBe(10);
    expect(element.value).toBe(10);
    expect(element.items).toBe(100);

    await elementIsStable(element);
    const previousEvent = untilEvent(element, 'change');
    emulateClick(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="left"]'));
    await previousEvent;
    expect(element.value).toBe(1);
  });

  it('should set a form value when value changes', async () => {
    await elementIsStable(element);
    const form = fixture.querySelector('form');
    expect(element.value).toBe(1);
    expect(Object.fromEntries(new FormData(form)).page).toBe('1');

    const nextEvent = untilEvent(element, 'change');
    emulateClick(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="right"]'));
    await nextEvent;
    expect(element.value).toBe(2);
    expect(Object.fromEntries(new FormData(form)).page).toBe('2');
  });

  it('should show only label when step selection is disabled', async () => {
    element.disableStep = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('label')).toBeTruthy();
    expect(element.shadowRoot.querySelector('nve-select')).toBe(null);
  });

  it('should set step value on select change', async () => {
    const select = element.shadowRoot.querySelector<HTMLSelectElement>('select');
    expect(element.step).toBe(10);
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    expect(element.step).toBe(20);
  });

  it('should emit step-change, input and change events when step changes', async () => {
    const stepChange = untilEvent(element, 'step-change');
    const input = untilEvent(element, 'input');
    const change = untilEvent(element, 'change');
    const select = element.shadowRoot.querySelector<HTMLSelectElement>('select');

    expect(element.step).toBe(10);
    select.value = '20';
    select.dispatchEvent(new Event('change'));

    await input;
    await change;
    const { detail } = await stepChange;
    expect(element.step).toBe(20);
    expect(detail).toBe(20);
  });

  it('should recompute the current page label if step changes and not on first page', async () => {
    const select = element.shadowRoot.querySelector<HTMLSelectElement>('select');
    const selectLabel = element.shadowRoot.querySelector('.select-label');
    element.value = 2;
    await elementIsStable(element);
    expect(selectLabel.textContent).toBe('10-20');

    select.value = '50';
    select.dispatchEvent(new Event('change'));
    await element.updateComplete;
    expect(selectLabel.textContent).toBe('50-100');
  });
});

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import type { IconButton } from '@nvidia-elements/core/icon-button';
import { Pagination } from '@nvidia-elements/core/pagination';
import { Select } from '@nvidia-elements/core/select';
import '@nvidia-elements/core/pagination/define.js';

describe(Pagination.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Pagination;
  let element2: Pagination;
  let element3: Pagination;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-pagination name="page" id="pagination-1" .value=${1} .step=${10} .items=${100}></nve-pagination>
        <nve-pagination id="pagination-2" .value=${1} .step=${100} .items=${10000} .stepSizes=${[100, 500, 1000]}></nve-pagination>
        <nve-pagination id="pagination-3" .value=${1} .step=${20} .items=${50000}>
          <span slot="suffix-label">of 50,000+ results</span>
        </nve-pagination>
      </form>
    `);
    element = fixture.querySelector('#pagination-1');
    element2 = fixture.querySelector('#pagination-2');
    element3 = fixture.querySelector('#pagination-3');
    await elementIsStable(element);
    await elementIsStable(element2);
    await elementIsStable(element3);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Pagination.metadata.tag)).toBeDefined();
  });

  it('should have a role of toolbar', async () => {
    await elementIsStable(element);
    expect(element._internals.role).toBe('toolbar');
  });

  it('should set the select label', async () => {
    expect(element.shadowRoot.querySelector('.select-label').textContent).toBe('1-10');

    element.value = 5;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.select-label').textContent).toBe('41-50');
  });

  it('should cap the select label end value at total items', async () => {
    element.items = 95;
    element.value = 10;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.select-label').textContent).toBe('91-95');
  });

  it('should number format items label', async () => {
    expect(element.shadowRoot.querySelector('label').textContent).toBe('of 100');
    element.items = 10_000;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('label').textContent).toBe('of 10,000');
  });

  it('should not show formatted items label if no items are provided', async () => {
    expect(element.shadowRoot.querySelector('label').textContent).toBe('of 100');
    element.items = 0;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('label')).toBe(null);
  });

  it('should apply aria labels to buttons and select', async () => {
    element.skippable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<HTMLSelectElement>('select').ariaLabel).toBe('current page');
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="left"]').ariaLabel).toBe(
      'previous'
    );
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="right"]').ariaLabel).toBe(
      'next'
    );
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="left"]').ariaLabel).toBe(
      'start'
    );
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="right"]').ariaLabel).toBe(
      'end'
    );
  });

  it('should disable previous and start buttons if at start of pages', async () => {
    element.skippable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="left"]').disabled).toBe(true);
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="left"]').disabled).toBe(
      true
    );
  });

  it('should disable next and end buttons if at end of pages', async () => {
    element.skippable = true;
    element.value = 10;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('.select-label').textContent).toBe('91-100');
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="chevron"][direction="right"]').disabled).toBe(
      true
    );
    expect(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="right"]').disabled).toBe(
      true
    );
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
    expect(element.shadowRoot.querySelector(Select.metadata.tag)).toBe(null);
  });

  it('should set step value on select change', async () => {
    const select = element.shadowRoot.querySelector<HTMLSelectElement>('select');
    expect(element.step).toBe(10);
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    expect(element.step).toBe(20);
  });

  it('should emit step-change when step changes', async () => {
    const stepChange = untilEvent(element, 'step-change');
    const select = element.shadowRoot.querySelector<HTMLSelectElement>('select');

    expect(element.step).toBe(10);
    select.value = '20';
    select.dispatchEvent(new Event('change'));

    const { detail } = (await stepChange) as CustomEvent;
    expect(element.step).toBe(20);
    expect(detail).toBe(20);
  });

  it('should not emit input or change if value has not changed', async () => {
    const stepChange = untilEvent(element, 'step-change');
    const select = element.shadowRoot.querySelector<HTMLSelectElement>('select');

    expect(element.step).toBe(10);
    select.value = '20';
    select.dispatchEvent(new Event('change'));

    let input = 0;
    let change = 0;
    element.addEventListener('input', () => input++);
    element.addEventListener('change', () => change++);
    await stepChange;
    expect(input).toBe(0);
    expect(change).toBe(0);
  });

  it('should emit last-page when the last page is active', async () => {
    const lastPage = untilEvent(element, 'last-page');
    element.skippable = true;
    await elementIsStable(element);
    emulateClick(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="right"]'));
    await lastPage;
    expect(element.value).toBe(10);
  });

  it('should emit last-page when the first page is active', async () => {
    const firstPage = untilEvent(element, 'first-page');
    element.skippable = true;
    await elementIsStable(element);
    emulateClick(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="right"]'));
    await elementIsStable(element);
    expect(element.value).toBe(10);

    emulateClick(element.shadowRoot.querySelector<IconButton>('[icon-name="arrow-stop"][direction="left"]'));
    await firstPage;
    expect(element.value).toBe(1);
  });

  it('should recompute the current page label if step changes and not on first page', async () => {
    const select = element.shadowRoot.querySelector<HTMLSelectElement>('select');
    const selectLabel = element.shadowRoot.querySelector('.select-label');
    element.value = 2;
    await elementIsStable(element);
    expect(selectLabel.textContent).toBe('11-20');

    select.value = '50';
    select.dispatchEvent(new Event('change'));
    await element.updateComplete;
    expect(selectLabel.textContent).toBe('51-100');
  });

  it('should select first option by default and render all options passed as step-sizes', async () => {
    const select = element2.shadowRoot.querySelector<HTMLSelectElement>('select');
    const selectLabel = element2.shadowRoot.querySelector('.select-label');
    element2.value = 2;
    await elementIsStable(element2);
    expect(selectLabel.textContent).toBe('101-200');
    expect(select.options[0].selected).toBe(true);

    // Check if options are rendered based on step-sizes provided
    expect(select.options.length).toBe(3);
    expect(select.options[0].value).toBe('100');
    expect(select.options[1].value).toBe('500');
    expect(select.options[2].value).toBe('1000');
  });

  it('should support custom suffix-label slot content', async () => {
    const slot = element3.shadowRoot.querySelector('slot[name="suffix-label"]') as HTMLSlotElement;
    const slottedElements = slot?.assignedElements();
    const customSpan = element3.querySelector('span[slot="suffix-label"]');

    expect(slottedElements.length).toBeGreaterThan(0);
    expect(slottedElements).toContain(customSpan);

    // Check that the custom content is correct
    expect(customSpan?.textContent).toBe('of 50,000+ results');
  });
});

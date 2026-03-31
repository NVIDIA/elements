import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { statusIcons } from '@nvidia-elements/core/internal';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';
import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/progress-ring/define.js';

describe(ProgressRing.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressRing;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-ring></nve-progress-ring>
    `);
    element = fixture.querySelector(ProgressRing.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ProgressRing.metadata.tag)).toBeDefined();
  });

  it('should set aria attributes', async () => {
    element.value = 50;
    element.max = 80;
    await elementIsStable(element);

    expect(element._internals.role).toBe('progressbar');
    expect(element._internals.ariaValueNow).toBe('50');
    expect(element._internals.ariaValueMax).toBe('80');
    expect(element._internals.ariaLabel).toBe('information');

    element.status = 'success';
    await elementIsStable(element);
    expect(element._internals.ariaLabel).toBe('success');
  });

  it('should default to neutral status', () => {
    expect(element.status).toBe('neutral');
  });

  it('should contain icons when status not equals accent', async () => {
    const nveIcon = element.shadowRoot.querySelector(Icon.metadata.tag) as Icon;

    element.status = 'warning';
    await elementIsStable(element);
    expect(element.status).toBe('warning');
    expect(nveIcon.name).toBe(statusIcons[element.status]);

    element.status = 'success';
    await elementIsStable(element);
    expect(element.status).toBe('success');
    expect(nveIcon.name).toBe(statusIcons[element.status]);

    element.status = 'danger';
    await elementIsStable(element);
    expect(element.status).toBe('danger');
    expect(nveIcon.name).toBe(statusIcons[element.status]);
  });

  it('should set indeterminate state when value is undefined', async () => {
    const internalHost = element.shadowRoot.querySelector('[internal-host]') as HTMLElement;
    expect(internalHost.hasAttribute('indeterminate')).toBe(true);

    element.value = 0;
    await elementIsStable(element);

    expect(internalHost.hasAttribute('indeterminate')).toBe(false);
  });

  it('should assign slotted content to the default slot, distinct from the internal status icon', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-progress-ring status="accent">
        <nve-icon name="pause" status="accent"></nve-icon>
      </nve-progress-ring>
    `);
    element = fixture.querySelector(ProgressRing.metadata.tag);
    await elementIsStable(element);

    const defaultSlot = element.shadowRoot.querySelector('slot:not([name])') as HTMLSlotElement;
    const assigned = defaultSlot.assignedElements();
    expect(assigned).toHaveLength(1);
    expect(assigned[0]).toBe(fixture.querySelector(Icon.metadata.tag));
  });

  it('should set stroke-dasharray to 0px 44px when value is 0', async () => {
    element.value = 0;
    await elementIsStable(element);
    const ring = element.shadowRoot.querySelector('.ring') as SVGCircleElement;
    expect(ring.getAttribute('stroke-dasharray')).toBe('0px 44px');
  });

  it('should cap stroke-dasharray at 44px when value exceeds max', async () => {
    element.value = 150;
    element.max = 100;
    await elementIsStable(element);
    const ring = element.shadowRoot.querySelector('.ring') as SVGCircleElement;
    const dashValue = parseFloat(ring.getAttribute('stroke-dasharray'));
    expect(dashValue).toBeGreaterThan(44);
  });

  it('should suppress the internal icon and show slotted content when the deprecated status-icon slot is used', async () => {
    removeFixture(fixture);
    /* eslint-disable @nvidia-elements/lint/no-unexpected-slot-value, @nvidia-elements/lint/no-deprecated-slots */
    fixture = await createFixture(html`
      <nve-progress-ring status="warning">
        <nve-icon name="pause" slot="status-icon"></nve-icon>
      </nve-progress-ring>
    `);
    /* eslint-enable @nvidia-elements/lint/no-unexpected-slot-value, @nvidia-elements/lint/no-deprecated-slots */
    element = fixture.querySelector(ProgressRing.metadata.tag);
    await elementIsStable(element);

    expect(element.shadowRoot.querySelector(Icon.metadata.tag)).toBeNull();

    const statusIconSlot = element.shadowRoot.querySelector('slot[name="status-icon"]') as HTMLSlotElement;
    expect(statusIconSlot.assignedElements()).toHaveLength(1);
    expect(statusIconSlot.assignedElements()[0]).toBe(fixture.querySelector(Icon.metadata.tag));
  });
});

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@elements/elements/test';
import { statusIcons } from '@elements/elements/internal';
import { ProgressRing } from '@elements/elements/progress-ring';
import { Icon } from '@elements/elements/icon';
import '@elements/elements/progress-ring/define.js';


describe('nve-progress-ring', () => {
  let fixture: HTMLElement;
  let element: ProgressRing;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-ring></nve-progress-ring>
    `);
    element = fixture.querySelector('nve-progress-ring');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get('nve-progress-ring')).toBeDefined();
  });

  it('should set aria attributes', async () => {
    element.value = 50;
    element.max = 80;
    await elementIsStable(element);

    expect(element._internals.role).toBe('progressbar');
    expect(element._internals.ariaValueNow).toBe('50');
    expect(element._internals.ariaValueMax).toBe('80');
  });

  it('should default to neutral status', () => {
    expect(element.status).toBe('neutral');
  });

  it('should contain icons when status not equals accent', async () => {
    const mlvIcon = element.shadowRoot.querySelector('nve-icon') as Icon;

    element.status = 'warning';
    await elementIsStable(element);
    expect(element.status).toBe('warning');
    expect(mlvIcon.name).toBe(statusIcons[element.status]);
    
    element.status = 'success';
    await elementIsStable(element);
    expect(element.status).toBe('success');
    expect(mlvIcon.name).toBe(statusIcons[element.status]);
    
    element.status = 'danger';
    await elementIsStable(element);
    expect(element.status).toBe('danger');
    expect(mlvIcon.name).toBe(statusIcons[element.status]);
  });

  it('should set indeterminate and zeroValue states', async () => {
    const internalHost = element.shadowRoot.querySelector('[internal-host]') as HTMLElement;
    expect(internalHost.hasAttribute('indeterminate')).toBe(true);

    element.value = 0;
    await elementIsStable(element);

    expect(internalHost.hasAttribute('zerovalue')).toBe(true);
  });
});

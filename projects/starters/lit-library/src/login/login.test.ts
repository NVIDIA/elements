import { html, render, type TemplateResult } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import type { DomainLogin } from 'lit-library-starter/login';
import 'lit-library-starter/login/define.js';

describe('domain-login', () => {
  let fixture: HTMLElement;
  let element: DomainLogin;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <domain-login></domain-login>
    `);
    element = fixture.querySelector('domain-login') as DomainLogin;
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', async () => {
    await elementIsStable(element);
    expect(customElements.get('domain-login')).toBeDefined();
  });

  it('should initialize values to internal controls', async () => {
    expect(element.value).toBe('{ "email": "", "password": "" }');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=email]')?.value).toBe('');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=password]')?.value).toBe('');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=checkbox]')?.value).toBe('on');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=checkbox]')?.checked).toBe(false);

    element.value = '{ "email": "test@nvidia.com", "password": "", "remember": true }';
    await elementIsStable(element);

    expect(element.value).toBe('{ "email": "test@nvidia.com", "password": "", "remember": true }');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=email]')?.value).toBe('test@nvidia.com');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=password]')?.value).toBe('');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=checkbox]')?.value).toBe('on');
    expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[type=checkbox]')?.checked).toBe(true);
  });

  it('should initialize the validity state', async () => {
    await elementIsStable(element);
    expect(element.validity.valid).toBe(false);
    expect(element.validity.valueMissing).toBe(true);
    expect(element.validity.patternMismatch).toBe(false);
  });

  it('should update validity state', async () => {
    await elementIsStable(element);
    expect(element.validity.valid).toBe(false);
    expect(element.validity.patternMismatch).toBe(false);

    element.value = '{ "email": "test@test.com", "password": "" }';
    await elementIsStable(element);
    element.checkValidity();

    expect(element.validity.valid).toBe(false);
    expect(element.validity.patternMismatch).toBe(true);
  });
});

async function createFixture(template: TemplateResult) {
  const fixture = document.createElement('div');
  document.body.append(fixture);
  render(template, fixture);
  await customElements.whenDefined('domain-login');
  return fixture;
}

function removeFixture(fixture: HTMLElement) {
  fixture.remove();
}

async function elementIsStable(element: DomainLogin, attemptsRemaining = 10): Promise<void> {
  if (await element.updateComplete) return;
  if (attemptsRemaining > 0) return elementIsStable(element, attemptsRemaining - 1);

  throw new Error('Element did not stabilize');
}

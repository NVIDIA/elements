import { html } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseButton } from '@nvidia-elements/core/internal';
import { createFixture, elementIsStable, emulateClick, untilEvent, removeFixture } from '@internals/testing';

@customElement('base-button-test-element')
class BaseButtonTestElement extends BaseButton {}

describe('base button', () => {
  let element: BaseButtonTestElement;
  let fixture: HTMLElement;
  let buttonInForm: BaseButtonTestElement;
  let submitButtonInForm: BaseButtonTestElement;
  let form: HTMLFormElement;
  let otherForm: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form id="other"></form>
    <base-button-test-element></base-button-test-element>
    <form id="main">
      <base-button-test-element type="button"></base-button-test-element>
      <base-button-test-element></base-button-test-element>
    </form>`);

    element = fixture.querySelectorAll<BaseButtonTestElement>('base-button-test-element')[0];
    buttonInForm = fixture.querySelectorAll<BaseButtonTestElement>('base-button-test-element')[1];
    submitButtonInForm = fixture.querySelectorAll<BaseButtonTestElement>('base-button-test-element')[2];
    form = fixture.querySelector('form[id=main]');
    form.addEventListener('submit', e => e.preventDefault());
    otherForm = fixture.querySelector('form[id=other]');
    otherForm.addEventListener('submit', e => e.preventDefault());
    buttonInForm.type = 'button';
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should add active state on mousedown', async () => {
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new MouseEvent('mousedown'));
    expect(element.matches(':state(active)')).toBe(true);

    element.dispatchEvent(new MouseEvent('mouseup'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should not add active state if element is disabled', async () => {
    element.disabled = true;
    expect(element.matches(':state(active)')).toBe(false);

    element.dispatchEvent(new MouseEvent('mousedown'));
    expect(element.matches(':state(active)')).toBe(false);
  });

  it('should initialize aria-disabled', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe('true');
    expect(element.matches(':state(disabled)')).toBe(true);
  });

  it('should update aria-disabled when disabled API is updated', async () => {
    element.disabled = true;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe('true');
    expect(element.matches(':state(disabled)')).toBe(true);

    element.disabled = false;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe('false');
    expect(element.matches(':state(disabled)')).toBe(false);
  });

  it('should remove aria-disabled if readonly', async () => {
    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaDisabled).toBe(null);
    expect(element.matches(':state(disabled)')).toBe(false);
  });

  it('should initialize aria-expanded as null', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe(null);
    expect(element.matches(':state(expanded)')).toBe(false);
  });

  it('should initialize aria-expanded as null if expanded not applied', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe(null);
    expect(element.matches(':state(expanded)')).toBe(false);
  });

  it('should initialize aria-expanded as true if expanded applied', async () => {
    element.expanded = true;
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe('true');
    expect(element.matches(':state(expanded)')).toBe(true);
  });

  it('should initialize aria-expanded as false if expanded=false is applied', async () => {
    element.expanded = false;
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe('false');
    expect(element.matches(':state(expanded)')).toBe(false);
  });

  it('should remove aria-expanded if readonly', async () => {
    element.expanded = true;
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe('true');
    expect(element.matches(':state(expanded)')).toBe(true);

    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaExpanded).toBe(null);
    expect(element.matches(':state(expanded)')).toBe(false);
  });

  it('should initialize aria-pressed as null', async () => {
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe(null);
    expect(element.matches(':state(pressed)')).toBe(false);
  });

  it('should initialize aria-pressed as null if pressed not applied', async () => {
    element.pressed = true;
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe('true');
    expect(element.matches(':state(pressed)')).toBe(true);
  });

  it('should initialize aria-pressed as false if pressed=false applied', async () => {
    element.pressed = false;
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe('false');
    expect(element.matches(':state(pressed)')).toBe(false);
  });

  it('should remove aria-pressed if readonly', async () => {
    element.pressed = true;
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe('true');
    expect(element.matches(':state(pressed)')).toBe(true);

    element.readonly = true;
    await elementIsStable(element);
    expect(element._internals.ariaPressed).toBe(null);
    expect(element.matches(':state(pressed)')).toBe(false);
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

  it('should remove tabindex and role if readonly', async () => {
    element.readonly = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
    expect(element._internals.role).toBe('none');
    expect(element.getAttribute('role')).toBe(null);
  });

  it('should set the button type to submit if not defined within a form element', async () => {
    await elementIsStable(element);
    expect(element.type).toBe(undefined);
    expect(buttonInForm.type).toBe('button');
    expect(submitButtonInForm.type).toBe('submit');
  });

  it('should add or remove button event listeners when readonly updates', async () => {
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.readonly).toBe(undefined);

    vi.spyOn(submitButtonInForm, 'removeEventListener');
    submitButtonInForm.readonly = true;
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.removeEventListener).toBeCalledTimes(3); // 2x button controller, 1x command controller

    vi.spyOn(submitButtonInForm, 'addEventListener');
    submitButtonInForm.readonly = false;
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.addEventListener).toBeCalledTimes(3); // 2x button controller, 1x command controller
  });

  it('should trigger submit event when host exists within a form element', async () => {
    submitButtonInForm.type = 'submit';
    await elementIsStable(submitButtonInForm);
    const event = untilEvent(form, 'submit');
    form.dispatchEvent(new Event('submit')); // todo: happy-dom mock does not properly emulate form submit behavior, this should not be needed
    emulateClick(submitButtonInForm);
    expect((await event).type).toBe('submit');
  });

  it('should not ineract with form elements if type button', async () => {
    submitButtonInForm.type = 'button';
    await elementIsStable(submitButtonInForm);
    const o = { f: () => null };
    vi.spyOn(o, 'f');

    form.addEventListener('submit', o.f);
    emulateClick(submitButtonInForm);

    const event = new KeyboardEvent('keyup', { key: 'enter' });
    submitButtonInForm.focus();
    submitButtonInForm.dispatchEvent(event);
    expect(o.f).not.toHaveBeenCalled();
  });

  it('should handle dynamic changes for type', async () => {
    const o = { f: () => null };
    vi.spyOn(o, 'f');

    // change default (implicit "submit") to type="button"
    submitButtonInForm.type = 'button';
    await elementIsStable(submitButtonInForm);
    form.addEventListener('submit', o.f);
    emulateClick(submitButtonInForm);
    expect(o.f).not.toHaveBeenCalled();

    // change type="button" to type="submit"
    submitButtonInForm.type = 'submit';
    await elementIsStable(submitButtonInForm);
    form.removeEventListener('submit', o.f);
    emulateClick(submitButtonInForm);

    // change from type="submit" to type="button"
    submitButtonInForm.type = 'button';
    await elementIsStable(submitButtonInForm);
    form.addEventListener('submit', o.f);
    emulateClick(submitButtonInForm);
    expect(o.f).not.toHaveBeenCalled();
  });

  it('should not interact with form elements if disabeld', async () => {
    submitButtonInForm.disabled = true;
    await elementIsStable(submitButtonInForm);

    const o = { f: () => null };
    vi.spyOn(o, 'f');

    form.addEventListener('submit', o.f);

    emulateClick(submitButtonInForm);

    expect(o.f).not.toHaveBeenCalled();
  });

  it('should respect form attribute', async () => {
    submitButtonInForm.form = 'other';
    await elementIsStable(submitButtonInForm);

    expect(submitButtonInForm.form).toBe(otherForm);

    const f = { f: () => null };
    vi.spyOn(f, 'f');
    form.addEventListener('submit', f.f);

    const o = { f: () => null };
    vi.spyOn(o, 'f');
    otherForm.addEventListener('submit', o.f);

    emulateClick(submitButtonInForm);

    expect(f.f).not.toHaveBeenCalled();
    expect(o.f).toHaveBeenCalled();
  });

  it('should return associated form if in a form element', async () => {
    await elementIsStable(element);
    expect(buttonInForm.form).toBe(form);
    expect(submitButtonInForm.form).toBe(form);
  });

  it('should be able to access form property from submit event even if form is not in the same document', async () => {
    element.form = 'main';
    element.type = 'submit';
    element.name = 'test-name';
    element.value = 'test-value';
    await elementIsStable(element);
    const submit = untilEvent(form, 'submit');
    emulateClick(element);
    const event = await submit;
    expect(event.target).toBe(form);
    expect((((await event) as SubmitEvent).submitter as HTMLButtonElement).name).toBe('test-name');
    expect(event.submitter.form).toBe(form);
    expect(event.submitter.name).toBe('test-name');
    expect(event.submitter.type).toBe('submit');
    expect(event.submitter.value).toBe('test-value');
    // expect(event.submitter).toBe(button); // https://github.com/WICG/webcomponents/issues/814
  });
});

describe('dynamic form reference', () => {
  it('should gracefully fall back to null if created and referencing a form not yet created', async () => {
    const button = document.createElement('base-button-test-element') as BaseButtonTestElement;
    button.setAttribute('form', 'test-form');
    expect(button.form).toBe(null);

    const form = document.createElement('form');
    form.id = 'test-form';
    document.body.appendChild(form);
    expect(button.form).toBe(null); // form is not available until form and button are attached to the DOM

    document.body.appendChild(button);
    expect(button.form).toBe(form); // form is now available after button and form are attached to the DOM

    document.body.removeChild(form);
    document.body.removeChild(button);
  });
});

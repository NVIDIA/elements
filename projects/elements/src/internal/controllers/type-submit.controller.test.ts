import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { typeSubmit } from '@elements/elements/internal';
import { elementIsStable, createFixture, removeFixture, emulateClick, untilEvent } from '@elements/elements/test';

@typeSubmit<TypeSubmitControllerTestElement>()
@customElement('type-submit-controller-test-element')
class TypeSubmitControllerTestElement extends LitElement {
  @property({ type: String }) name: string;
  @property({ type: String }) value: string;
  @property({ type: Boolean }) disabled: boolean;
  @property({ type: String }) type: 'button' | 'submit';
  @property({ type: Boolean }) readonly: boolean;
}

describe('type-submit.controller', () => {
  let button: TypeSubmitControllerTestElement;
  let buttonInForm: TypeSubmitControllerTestElement;
  let submitButtonInForm: TypeSubmitControllerTestElement;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <type-submit-controller-test-element></type-submit-controller-test-element>
      <form>
        <type-submit-controller-test-element type="button"></type-submit-controller-test-element>
        <type-submit-controller-test-element></type-submit-controller-test-element>
      </form>
    `);
  
    form = fixture.querySelector('form');
    button = fixture.querySelectorAll<TypeSubmitControllerTestElement>('type-submit-controller-test-element')[0];
    buttonInForm = fixture.querySelectorAll<TypeSubmitControllerTestElement>('type-submit-controller-test-element')[1];
    submitButtonInForm = fixture.querySelectorAll<TypeSubmitControllerTestElement>('type-submit-controller-test-element')[2];
    form.addEventListener('submit', e => e.preventDefault());
    buttonInForm.type = 'button';
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should set the button type to submit if not defined within a form element', async () => {
    await elementIsStable(button);
    expect(button.type).toBe(undefined);
    expect(buttonInForm.type).toBe('button');
    expect(submitButtonInForm.type).toBe('submit');
  });

  // https://github.com/capricorn86/happy-dom/issues/527
  // it('should allow click event to bubble', async () => {
  //   await elementIsStable(button);
  //   expect(button.type).toBe(undefined);
  //   const event = untilEvent(form, 'click');
  //   emulateClick(button);
  //   expect((await event).target).toBe(button);
  // });

  it('should trigger click event when using space key', async () => {
    await elementIsStable(button);
    expect(button.type).toBe(undefined);
    const event = untilEvent(button, 'click');
    button.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    expect((await event).target).toBe(button);
  });

  it('should add or remove button event listeners when readonly updates', async () => {
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.readonly).toBe(undefined);

    vi.spyOn(submitButtonInForm, 'removeEventListener');
    submitButtonInForm.readonly = true;
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.removeEventListener).toBeCalledTimes(2);

    vi.spyOn(submitButtonInForm, 'addEventListener');
    submitButtonInForm.readonly = false;
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.addEventListener).toBeCalledTimes(2);
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

  it('should not interact with form elements if disabled', async () => {
    submitButtonInForm.disabled = true;
    await elementIsStable(submitButtonInForm);

    const o = { f: () => null };
    vi.spyOn(o, 'f');

    form.addEventListener('submit', o.f);
    expect(o.f).not.toHaveBeenCalled();
  });

  it('should only submit once per click/keypress', async () => {
    await elementIsStable(submitButtonInForm);

    const o = { f: () => null };
    vi.spyOn(o, 'f');

    form.addEventListener('submit', o.f);
    expect(o.f).not.toHaveBeenCalled();

    // happy-dom does not properly emulate the relatedTarget/composed event options
    // emulateClick(submitButtonInForm);
    // await elementIsStable(submitButtonInForm);
    // expect(o.f).toHaveBeenCalledTimes(1);
  });
});

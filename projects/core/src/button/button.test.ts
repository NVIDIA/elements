// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
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

describe('dynamic form reference', () => {
  it('should gracefully fall back to null if created and referencing a form not yet created', async () => {
    const button = document.createElement('nve-button') as Button;
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

describe(`${Button.metadata.tag} - button semantics`, () => {
  let element: Button;
  let fixture: HTMLElement;
  let buttonInForm: Button;
  let submitButtonInForm: Button;
  let form: HTMLFormElement;
  let otherForm: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
    <form id="other"></form>
    <nve-button></nve-button>
    <form id="main">
      <nve-button type="button"></nve-button>
      <nve-button></nve-button>
    </form>`);

    element = fixture.querySelectorAll<Button>('nve-button')[0];
    buttonInForm = fixture.querySelectorAll<Button>('nve-button')[1];
    submitButtonInForm = fixture.querySelectorAll<Button>('nve-button')[2];
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
    element.readOnly = true;
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

    element.readOnly = true;
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

    element.readOnly = true;
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
    element.readOnly = true;
    await elementIsStable(element);
    expect(element.tabIndex).toBe(-1);
    expect(element._internals.role).toBe('none');
    expect(element.getAttribute('role')).toBe(null);
  });

  it('should map readonly attribute to readOnly property', async () => {
    element.setAttribute('readonly', '');
    await elementIsStable(element);
    expect(element.readOnly).toBe(true);
  });

  it('should reflect readOnly property to readonly attribute', async () => {
    element.readOnly = true;
    await elementIsStable(element);
    expect(element.hasAttribute('readonly')).toBe(true);

    element.readOnly = false;
    await elementIsStable(element);
    expect(element.hasAttribute('readonly')).toBe(false);
  });

  it('should support deprecated readonly property alias', async () => {
    element.readonly = true;
    await elementIsStable(element);
    expect(element.readOnly).toBe(true);
    expect(element.hasAttribute('readonly')).toBe(true);
  });

  it('should set the button type to submit if not defined within a form element', async () => {
    await elementIsStable(element);
    expect(element.type).toBe(undefined);
    expect(buttonInForm.type).toBe('button');
    expect(submitButtonInForm.type).toBe('submit');
  });

  it('should add or remove button event listeners when readOnly updates', async () => {
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.readOnly).toBe(false);

    vi.spyOn(submitButtonInForm, 'removeEventListener');
    submitButtonInForm.readOnly = true;
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.removeEventListener).toBeCalledTimes(3); // 2x button controller, 1x command controller

    vi.spyOn(submitButtonInForm, 'addEventListener');
    submitButtonInForm.readOnly = false;
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.addEventListener).toBeCalledTimes(3); // 2x button controller, 1x command controller
  });

  it('should trigger submit event when host exists within a form element', async () => {
    submitButtonInForm.type = 'submit';
    await elementIsStable(submitButtonInForm);
    const event = untilEvent(form, 'submit');
    form.dispatchEvent(new Event('submit')); // happy-dom does not emulate form submit behavior, so a manual dispatch is required
    emulateClick(submitButtonInForm);
    expect((await event).type).toBe('submit');
  });

  it('should not interact with form elements if type button', async () => {
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

  it('should accept a direct form element reference', async () => {
    submitButtonInForm.form = otherForm;
    await elementIsStable(submitButtonInForm);

    expect(submitButtonInForm.form).toBe(otherForm);
    expect(submitButtonInForm.hasAttribute('form')).toBe(false);
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

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture, untilEvent, emulateClick } from '@nvidia-elements/testing';
import { TypeCommandController } from '@nvidia-elements/core/internal';

@customElement('type-command-controller-test-element')
class TypeCommandControllerTestElement extends LitElement {
  @property({ type: String }) command: string;
  @property({ type: String, attribute: 'commandfor' }) commandFor: string;
  @property({ type: Boolean }) readonly: boolean;
  @property({ type: Boolean }) disabled: boolean;
  #typeCommandController = new TypeCommandController(this);
}

describe('type-command.controller', () => {
  let element: TypeCommandControllerTestElement;
  let target: HTMLElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`
        <type-command-controller-test-element command="--test" commandfor="target"></type-command-controller-test-element>
        <div id="target"></div>
      `
    );
    element = fixture.querySelector<TypeCommandControllerTestElement>('type-command-controller-test-element');
    target = fixture.querySelector<HTMLElement>('#target');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should trigger command event when clicked', async () => {
    const event = untilEvent<Event & { source: HTMLElement; command: string }>(target, 'command');
    await emulateClick(element);
    const { source, command } = await event;
    expect(source).toBe(element);
    expect(command).toBe('--test');
  });
});

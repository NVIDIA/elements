import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent, emulateClick } from '@internals/testing';
import { Dropzone } from '@nvidia-elements/core/dropzone';
import '@nvidia-elements/core/dropzone/define.js';

describe(Dropzone.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dropzone;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-dropzone id="dropzone" name="files"></nve-dropzone>
      </form>
    `);
    element = fixture.querySelector(Dropzone.metadata.tag);
    input = element.shadowRoot.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Dropzone.metadata.tag)).toBeDefined();
  });

  it('should report validity', async () => {
    expect(element.validity instanceof ValidityState).toBe(true);
  });

  it('should report validationMessage', async () => {
    expect(element.validationMessage).toBe('');
  });

  it('should report willValidate', async () => {
    expect(element.willValidate).toBe(true);
  });

  it('should report checkValidity', async () => {
    expect(element.checkValidity()).toBe(true);
  });

  it('should report reportValidity', async () => {
    expect(element.reportValidity()).toBe(true);
  });

  it('should have default properties', () => {
    expect(element.accept).to.equal('image/gif, image/jpeg, image/png, image/svg+xml');
    expect(element.maxFileSize).to.equal(2 * 1024 ** 2);
  });

  it('should update properties when set', () => {
    element.accept = 'image/png';
    element.maxFileSize = 2 * 1024 ** 4;

    expect(element.accept).to.equal('image/png');
    expect(element.maxFileSize).to.equal(2 * 1024 ** 4);
  });

  it('should accept all files without filtering by type', async () => {
    const validFile = new File(['content'], 'test.png', { type: 'image/png' });
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(validFile);
    dataTransfer.items.add(invalidFile);

    const dropEvent = new DragEvent('drop', {
      dataTransfer,
      bubbles: true,
      cancelable: true
    });

    const changePromise = untilEvent(element, 'change');
    input.dispatchEvent(dropEvent);
    await changePromise;

    expect(element.value.length).toBe(2);
    expect(element.value[0].name).toBe('test.png');
    expect(element.value[1].name).toBe('test.txt');
  });

  it('should accept all files without filtering by size', async () => {
    const smallFile = new File(['small'], 'small.png', { type: 'image/png' });
    const largeFile = new File(['x'.repeat(200)], 'large.png', { type: 'image/png' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(smallFile);
    dataTransfer.items.add(largeFile);

    const dropEvent = new DragEvent('drop', {
      dataTransfer,
      bubbles: true,
      cancelable: true
    });

    element.maxFileSize = 100;

    const changePromise = untilEvent(element, 'change');
    input.dispatchEvent(dropEvent);
    await changePromise;

    expect(element.value.length).toBe(2);
    expect(element.value[0].name).toBe('small.png');
    expect(element.value[1].name).toBe('large.png');
  });

  it('should accumulate files when dropped multiple times', async () => {
    const smallFile = new File(['small'], 'small.png', { type: 'image/png' });

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(smallFile);

    const dropEvent = new DragEvent('drop', {
      dataTransfer,
      bubbles: true,
      cancelable: true
    });

    element.accept = '.png';

    let changePromise = untilEvent(element, 'change');
    input.dispatchEvent(dropEvent);
    await changePromise;

    expect(element.value.length).toBe(1);
    expect(element.value[0].name).toBe('small.png');

    element.accept = 'image/*';

    changePromise = untilEvent(element, 'change');
    input.dispatchEvent(dropEvent);
    await changePromise;

    expect(element.value.length).toBe(2);
    expect(element.value[0].name).toBe('small.png');
  });

  it('should handle file input change', async () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    const changePromise = untilEvent(element, 'change');
    input.dispatchEvent(new Event('change'));
    await changePromise;

    expect(element.value.length).toBe(1);
    expect(element.value[0].name).toBe('test.png');
  });

  it('should support form reset', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    element.value = [file];
    expect(element.value.length).toBe(1);

    element.formResetCallback();
    expect(element.value.length).toBe(0);
  });

  it('should create valid form data', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    element.value = [file];

    const formData = new FormData(fixture.querySelector('form'));
    const files = formData.getAll('files');

    expect(files.length).toBe(1);
    expect(files[0]).toStrictEqual(file);
  });

  it('should add highlighted attribute on dragenter', async () => {
    const dragenterEvent = new DragEvent('dragenter', {
      bubbles: true,
      cancelable: true
    });
    const container: HTMLElement = element.shadowRoot.querySelector('.container');

    const changePromise = untilEvent(container, 'dragenter');
    container.dispatchEvent(dragenterEvent);
    await changePromise;

    expect(element.hasAttribute('highlighted')).toBe(true);
  });

  it('should maintain highlighted state on dragover', async () => {
    const dragoverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true
    });
    const container: HTMLElement = element.shadowRoot.querySelector('.container');

    const changePromise = untilEvent(container, 'dragover');
    container.dispatchEvent(dragoverEvent);
    await changePromise;

    expect(element.hasAttribute('highlighted')).toBe(true);
  });

  it('should remove highlighted attribute on dragleave', async () => {
    element.setAttribute('highlighted', '');
    expect(element.hasAttribute('highlighted')).toBe(true);

    const container: HTMLElement = element.shadowRoot.querySelector('.container');

    const dragleaveEvent = new DragEvent('dragleave', {
      bubbles: true,
      cancelable: true
    });

    const changePromise = untilEvent(container, 'dragleave');
    container.dispatchEvent(dragleaveEvent);
    await changePromise;

    expect(element.hasAttribute('highlighted')).toBe(false);
  });

  it('should handle click event', async () => {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });

    const changePromise = untilEvent(element, 'click');
    const click = input.dispatchEvent(clickEvent);
    await changePromise;

    expect(click).toBe(true);
  });

  it('should remove highlighted attribute on drop', async () => {
    element.setAttribute('highlighted', '');
    expect(element.hasAttribute('highlighted')).toBe(true);

    const dropEvent = new DragEvent('drop', {
      dataTransfer: new DataTransfer(),
      bubbles: true,
      cancelable: true
    });

    const changePromise = untilEvent(element, 'change');
    input.dispatchEvent(dropEvent);
    await changePromise;

    expect(element.hasAttribute('highlighted')).toBe(false);
  });

  it('should render custom icon slot content', async () => {
    const fixture = await createFixture(html`
      <nve-dropzone><div slot="icon" id="test">Test</div></nve-dropzone>
    `);
    element = fixture.querySelector(Dropzone.metadata.tag);
    await elementIsStable(element);

    const slot = element.shadowRoot.querySelector('slot[name="icon"]');
    expect(slot).to.exist;

    const slottedContent = element.querySelector('#test');
    expect(slottedContent).to.exist;
    expect(slottedContent.textContent).to.equal('Test');

    removeFixture(fixture);
  });

  it('should render custom content slot', async () => {
    const fixture = await createFixture(html`
      <nve-dropzone>
        <div>Custom Content</div>
      </nve-dropzone>
    `);
    element = fixture.querySelector(Dropzone.metadata.tag);
    await elementIsStable(element);

    const slot = element.shadowRoot.querySelector('slot:not([name])');
    expect(slot).to.exist;

    const slottedContent = element.querySelector('div');
    expect(slottedContent).to.exist;
    expect(slottedContent.textContent).to.equal('Custom Content');

    removeFixture(fixture);
  });

  it('should open file picker on Enter key press', async () => {
    const container: HTMLElement = element.shadowRoot.querySelector('.container');
    let clickCalled = false;
    const originalClick = input.click.bind(input);
    input.click = () => {
      clickCalled = true;
      originalClick();
    };

    container.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    emulateClick(container);
    expect(clickCalled).toBe(true);
  });

  it('should not render blank slot content', async () => {
    const fixture = await createFixture(html`
      <nve-dropzone>
        <div slot="icon" id="test">Test</div>
      </nve-dropzone>
    `);
    element = fixture.querySelector(Dropzone.metadata.tag);
    await elementIsStable(element);

    const slot = element.shadowRoot.querySelector('slot[name="icon"]');
    expect(slot).to.exist;

    removeFixture(fixture);
  });
});

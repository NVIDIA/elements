import { html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { BaseFormAssociatedElement, formatFileSize, useStyles, removeEmptyTextNode } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './dropzone.css?inline';

/**
 * @element nve-dropzone
 * @description A dropzone form control that enables users to drag anddrop files onto it.
 * @since 1.29.0
 * @entrypoint \@nvidia-elements/core/dropzone
 * @cssprop --background
 * @cssprop --border-color
 * @cssprop --border-radius
 * @cssprop --min-height
 * @slot icon - default slot for icon
 * @slot content - default slot for content
 * @storybook  https://NVIDIA.github.io/elements/api/?path=/docs/elements-dropzone-documentation--docs
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/branch/Y4puI42AmbVoGryu6yJqNl/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=2915-74822&p=f&t=f7SAVbl2KRCFZZul-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 * @stable false
 */
export class Dropzone extends BaseFormAssociatedElement<File[]> {
  @property()
  accept: string = `image/gif, image/jpeg, image/png, image/svg+xml`;

  @property({ attribute: 'max-file-size', type: Number })
  maxFileSize: number = 2 * 1024 ** 2;

  @query('#dropzone-input')
  private fileInput: HTMLInputElement;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dropzone',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  /** @private */
  declare _internals: ElementInternals;

  formResetCallback() {
    this.value = [];
    this.requestUpdate();
  }

  constructor() {
    super();
    this.value = [];
  }

  connectedCallback(): void {
    super.connectedCallback();
    globalThis.document.addEventListener('dragover', this.#preventDefaults);
    globalThis.document.addEventListener('drop', this.#preventDefaults);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    globalThis.document.removeEventListener('dragover', this.#preventDefaults);
    globalThis.document.removeEventListener('drop', this.#preventDefaults);
  }

  #preventDefaults(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  #handleClick() {
    this.fileInput.click();
  }

  #handleDragEnter(event: DragEvent) {
    this.#preventDefaults(event);
    this.#toggleHighlighted(true);
  }

  #handleDragOver(event: DragEvent) {
    this.#preventDefaults(event);
    this.#toggleHighlighted(true);
  }

  #handleDragLeave(event: DragEvent) {
    this.#preventDefaults(event);
    this.#toggleHighlighted(false);
  }

  #handleDrop(event: DragEvent) {
    this.#preventDefaults(event);
    this.#toggleHighlighted(false);

    const files = Array.from(event.dataTransfer.files);
    this.#addFiles(files);
  }

  #handleFileInputChange(event: Event) {
    this.#preventDefaults(event);

    const files = Array.from(this.fileInput.files);
    this.#addFiles(files);

    this.fileInput.value = '';
  }

  #addFiles(files: File[]) {
    let acceptableFiles = this.#filterFileTypes(files);
    acceptableFiles = this.#filterFileSize(acceptableFiles);
    this.value = [...this.value, ...acceptableFiles];
    this.dispatchChangeEvent();
  }

  #filterFileTypes(files: File[]) {
    const acceptedTypes = this.#getFileTypeSpecifiers(this.accept);
    return files.filter(file => {
      return acceptedTypes.some(acceptedType => {
        if (file.type.includes(acceptedType)) {
          return file;
        }
      });
    });
  }

  #getFileTypeSpecifiers(acceptTypes) {
    const types = acceptTypes.split(',').map(value => {
      value = value.trim();
      if (value.startsWith('.')) {
        value = value.slice(1);
      }
      if (value.endsWith('/*')) {
        value = value.split('/')[0];
      }
      if (value.includes('/')) {
        value = value.split('/')[1];
      }
      if (value.includes('+')) {
        value = value.split('+')[0];
      }
      return value;
    });
    return types;
  }

  #formatFileTypeSpecifiers(acceptTypes: string) {
    const types = this.#getFileTypeSpecifiers(acceptTypes);

    if (types.length === 1) {
      return types[0].toUpperCase();
    }

    const lastType = types.pop();
    return `${types.join(', ').toUpperCase()} or ${lastType.toUpperCase()}`;
  }

  #filterFileSize(files: File[]) {
    return files.filter(file => file.size <= this.maxFileSize);
  }

  #toggleHighlighted(highlighted: boolean) {
    this.toggleAttribute('highlighted', highlighted);
  }

  #removeEmptyNodes(e) {
    e.target.assignedNodes().forEach(node => removeEmptyTextNode(node));
  }

  render() {
    return html`<div internal-host>
      <div class="container"
        @click=${this.#handleClick} 
        @dragenter=${this.#handleDragEnter}
        @dragover=${this.#handleDragOver}
        @dragleave=${this.#handleDragLeave}
        @drop=${this.#handleDrop}>
        <svg class="border" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="none" rx="4" ry="4" stroke="currentColor" stroke-width="2" stroke-dasharray="6,6" stroke-dashoffset="0" stroke-linecap="square" />
        </svg>
        <slot name="icon"><nve-icon class="icon" name="upload"></nve-icon></slot>
        <slot @slotchange=${this.#removeEmptyNodes}>
          <div class="text-center">
            <div class="text-bold">${this.i18n.dragAndDrop} ${this.i18n.files} ${this.i18n.or} <span class="text-emphasized">${this.i18n.browseFiles}</span></div>
            <div class="text-muted">${this.#formatFileTypeSpecifiers(this.accept)} &mdash; ${this.i18n.maxFileSize} ${formatFileSize(this.maxFileSize)}</div>
          </div>
        </slot>
        <input id="dropzone-input" type="file" accept=${this.accept} @change=${this.#handleFileInputChange} multiple hidden></input>
      </div>
    </div>`;
  }
}

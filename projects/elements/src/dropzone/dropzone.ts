import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { query } from 'lit/decorators/query.js';
import { formatFileSize, useStyles, removeEmptyTextNode, I18nController } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './dropzone.css?inline';
import { FormControlMixin } from '@nvidia-elements/forms/mixin';
import { fileTypeValidator, fileSizeValidator, getFileTypeSpecifiers } from './dropzone.util';

/**
 * @element nve-dropzone
 * @description A dropzone form control that enables users to drag and drop files onto it.
 * @since 1.29.0
 * @entrypoint \@nvidia-elements/core/dropzone
 * @event change - Dispatched when the value has changed (files located in event.target)
 * @slot - use only when custom messaging requires it
 * @cssprop --background
 * @cssprop --border-color
 * @cssprop --border-radius
 * @cssprop --padding
 * @cssprop --min-height
 * @cssprop --color
 * @slot icon - default slot for icon
 * @slot content - default slot for content
 * @csspart icon - The upload icon element
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 * @stable false
 */
export class Dropzone extends FormControlMixin<typeof LitElement, File[]>(LitElement) {
  @property()
  accept: string = `image/gif, image/jpeg, image/png, image/svg+xml`;

  @property({ attribute: 'max-file-size', type: Number })
  maxFileSize: number = 2 * 1024 ** 2;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to update for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  @query('#dropzone-input')
  private fileInput: HTMLInputElement;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dropzone',
    version: '0.0.0',
    validators: [fileTypeValidator, fileSizeValidator],
    valueSchema: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const },
          size: { type: 'number' as const },
          type: { type: 'string' as const }
        }
      }
    }
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

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
    this.setAttribute('nve-control', '');
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

    const files = Array.from(event.dataTransfer!.files);
    this.#addFiles(files);
  }

  #handleFileInputChange(event: Event) {
    this.#preventDefaults(event);

    const files = Array.from(this.fileInput.files!);
    this.#addFiles(files);

    this.fileInput.value = '';
  }

  #addFiles(files: File[]) {
    this.value = [...(this.value ?? []), ...files];
    this.dispatchChangeEvent();
  }

  #formatFileTypeSpecifiers(acceptTypes: string) {
    const types = getFileTypeSpecifiers(acceptTypes);

    if (types.length === 1) {
      return types[0]!.toUpperCase();
    }

    const lastType = types.pop();
    return `${types.join(', ').toUpperCase()} or ${lastType!.toUpperCase()}`;
  }

  #toggleHighlighted(highlighted: boolean) {
    this.toggleAttribute('highlighted', highlighted);
  }

  #removeEmptyNodes(e: Event) {
    (e.target as HTMLSlotElement).assignedNodes().forEach((node: Node) => removeEmptyTextNode(node));
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
        <slot name="icon"><nve-icon part="icon" class="icon" name="upload"></nve-icon></slot>
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

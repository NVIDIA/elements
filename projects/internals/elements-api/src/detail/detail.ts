import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import showdown from 'showdown';
import { useStyles } from '@nvidia-elements/core/internal';
import { MetadataService } from '@internals/metadata'; // eslint-disable-line
import styles from './detail.css?inline';

const showdownOptions = { simplifiedAutoLink: true };

export class Detail extends LitElement {
  @property({ type: String }) tag = '';

  @property({ type: String }) type: 'description' | 'property' | 'event' | 'slot' | 'story';

  @property({ type: String }) value: string;

  @state() private element;

  static styles = useStyles([styles]);

  static metadata = {
    tag: 'nve-api-detail',
    version: '0.0.0'
  };

  #markdown = new showdown.Converter(showdownOptions);

  render() {
    return this.element
      ? html`
      ${this.type === 'description' ? html`<div .innerHTML=${this.#markdown.makeHtml(this.element.manifest.description ?? '')}></div>` : nothing}
      ${this.type === 'event' ? html`<div .innerHTML=${this.#markdown.makeHtml(`<code>${this.value}</code>: ` + this.element.manifest.events?.find(m => m.name === this.value)?.description)}></div>` : nothing}
      ${this.type === 'property' ? html`<div .innerHTML=${this.#markdown.makeHtml(this.element.manifest.members?.find(m => m.name === this.value)?.description ?? '')}></div>` : nothing}
      ${this.type === 'slot' ? html`<div .innerHTML=${this.#markdown.makeHtml(this.element.manifest.slots?.find(m => m.name === this.value)?.description ?? '')}></div>` : nothing}
      ${this.type === 'story' ? html`<div .innerHTML=${this.#markdown.makeHtml(this.element.stories?.find(m => m.id === this.value)?.description ?? '')}></div>` : nothing}
    `
      : nothing;
  }

  async connectedCallback() {
    super.connectedCallback();
    const metadata = await MetadataService.getMetadata();
    const elements = Object.keys(metadata).flatMap(packageName => metadata[packageName].elements ?? []);
    this.element = elements.find(d => d.name === this.tag);
  }
}

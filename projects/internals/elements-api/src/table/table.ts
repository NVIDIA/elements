import { html, nothing, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import showdown from 'showdown';
import { MetadataService } from '../internals/metadata.service.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './table.css?inline';

export class Table extends LitElement {
  @property({ type: String }) tag = '';

  @property({ type: String, reflect: true }) type: 'properties' | 'css-properties' | 'slots' | 'events' | 'all' = 'all';

  @state() private manifest;

  static metadata = {
    tag: 'nve-api-table',
    version: '0.0.0'
  };

  static styles = useStyles([styles]);

  #markdown = new showdown.Converter({ simplifiedAutoLink: true });

  get #anchor() {
    const newUrl = new URL(globalThis.parent.location.href);
    newUrl.searchParams.set('anchor', 'element-api');
    return newUrl.toString();
  }

  render() {
    return this.manifest
      ? html`
      ${
        this.type === 'all'
          ? html`
      <div>
        <h2 class="dynamic-anchor">
          <a href=${this.#anchor} target="_blank" aria-label="copy link"><nve-icon name="link"></nve-icon></a>
          API - ${this.tag}
        </h2>
        <nve-divider></nve-divider>
      </div>`
          : nothing
      }
      ${
        this.type === 'properties' || this.type === 'all'
          ? html`
        <div>
          ${this.type === 'all' ? html`<h3>Properties</h3>` : nothing}
          <nve-grid>
            <nve-grid-header>
              <nve-grid-column width="120px">Property</nve-grid-column>
              <nve-grid-column width="180px">Attribute</nve-grid-column>
              <nve-grid-column>Description</nve-grid-column>
              <nve-grid-column>Type</nve-grid-column>
            </nve-grid-header>
            ${this.manifest.attributes?.map(
              attr => html`
            <nve-grid-row>
              <nve-grid-cell>${attr.fieldName}</nve-grid-cell>
              <nve-grid-cell>${attr.name}</nve-grid-cell>
              <nve-grid-cell .innerHTML=${this.#markdown.makeHtml(attr.description ?? '')}></nve-grid-cell>
              <nve-grid-cell>
                <div class="tags">
                  ${attr.type?.text ? html`${attr.type?.text.split(' | ').map(i => html`<nve-tag readonly color="gray-slate">${i.replaceAll("'", '')}</nve-tag>`)}` : nothing}
                  ${attr.enum ? html`${attr.enum.map(i => html`<nve-tag readonly color="gray-slate">${i.replaceAll("'", '')}</nve-tag>`)}` : nothing}
                  ${attr.type && !attr.type.text ? html`<nve-tag readonly color="gray-slate">${attr.type.replaceAll("'", '')}</nve-tag>` : nothing}
                </div>
              </nve-grid-cell>
            </nve-grid-row>
            `
            )}
            ${!this.manifest.attributes?.length ? html`<nve-grid-placeholder><h4>no properties</h4></nve-grid-placeholder>` : nothing}
          </nve-grid>
        </div>`
          : nothing
      }

      ${
        this.type === 'events' || this.type === 'all'
          ? html`
        <div>
          ${this.type === 'all' ? html`<h3>Events</h3>` : nothing}
          <nve-grid>
            <nve-grid-header>
              <nve-grid-column>Event</nve-grid-column>
              <nve-grid-column>Description</nve-grid-column>
            </nve-grid-header>
            ${this.manifest.events?.map(
              event => html`
            <nve-grid-row>
              <nve-grid-cell>${event.name}</nve-grid-cell>
              <nve-grid-cell .innerHTML=${this.#markdown.makeHtml(event.description ?? '')}></nve-grid-cell>
            </nve-grid-row>`
            )}
            ${!this.manifest.events?.length ? html`<nve-grid-placeholder><h4>no events</h4></nve-grid-placeholder>` : nothing}
          </nve-grid>
        </div>`
          : nothing
      }

      ${
        this.type === 'slots' || this.type === 'all'
          ? html`
        <div>
          ${this.type === 'all' ? html`<h3>Slots</h3>` : nothing}
          <nve-grid>
            <nve-grid-header>
              <nve-grid-column>Slot</nve-grid-column>
              <nve-grid-column>Description</nve-grid-column>
            </nve-grid-header>
            ${this.manifest.slots?.map(
              slot => html`
            <nve-grid-row>
              <nve-grid-cell>${slot.name?.length ? slot.name : 'Default'}</nve-grid-cell>
              <nve-grid-cell .innerHTML=${this.#markdown.makeHtml(slot.description ?? '')}></nve-grid-cell>
            </nve-grid-row>`
            )}
            ${!this.manifest.slots?.length ? html`<nve-grid-placeholder><h4>no slots</h4></nve-grid-placeholder>` : nothing}
          </nve-grid>
        </div>`
          : nothing
      }

      ${
        this.type === 'css-properties' || this.type === 'all'
          ? html`
        <div>
          ${this.type === 'all' ? html`<h3>CSS Properties</h3>` : nothing}
          <nve-grid>
            <nve-grid-header>
              <nve-grid-column>Name</nve-grid-column>
              <nve-grid-column>Description</nve-grid-column>
            </nve-grid-header>
            ${this.manifest.cssProperties?.map(
              prop => html`
            <nve-grid-row>
              <nve-grid-cell>${prop.name}</nve-grid-cell>
              <nve-grid-cell>
                ${
                  !prop.name.includes('icon') && this.#checkIfPropertyExists(prop.name.replace('--', ''))
                    ? html`<a href=${`https://developer.mozilla.org/en-US/docs/Web/CSS/${prop.name.replace('--', '')}`} target="_blank" rel="none">MDN Documentation</a>`
                    : nothing
                }
              </nve-grid-cell>
            </nve-grid-row>`
            )}
            ${!this.manifest.cssProperties?.length ? html`<nve-grid-placeholder><h4>no css properties</h4></nve-grid-placeholder>` : nothing}
          </nve-grid>
        </div>`
          : nothing
      }
    `
      : nothing;
  }

  #checkIfPropertyExists(property) {
    return CSS.supports(`${property}: initial`);
  }

  updated(props) {
    super.updated(props);
    if (this.type === 'all') {
      this.id = `element-api`;
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    const metadata = await MetadataService.getMetadata();
    const elements = Object.keys(metadata).flatMap(packageName => metadata[packageName].elements ?? []);
    this.manifest = elements.find(d => d.name === this.tag)?.manifest;
  }
}

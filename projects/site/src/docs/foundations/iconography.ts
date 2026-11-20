// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { css, html, LitElement, nothing } from 'lit';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { Icon, ICON_NAMES, ICON_NAMES_SOLID } from '@nvidia-elements/core/icon';
import type { IconName } from '@nvidia-elements/core/icon';
import { IconNames as GUI_ICON_NAMES } from '@nvidia/gui-icons';
import type { IconName as GuiIconName } from '@nvidia/gui-icons';

import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/copy-button/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/code/code-block/languages/html.js';
import '@nvidia-elements/code/code-block/languages/javascript.js';
import '@nvidia-elements/code/code-block/define.js';

const GUI_ICONS = new Map(
  Object.entries(
    import.meta.glob<string>('../../../node_modules/@nvidia/gui-icons/assets/{line,fill}/*.svg', {
      query: '?raw',
      import: 'default',
      exhaustive: true
    })
  ).map(([path, svg]) => [path.replace(/^.*\/assets\//, ''), svg])
);

type CatalogIconName = IconName | GuiIconName;

@customElement('nvd-icon-catalog')
export class IconCatalog extends LitElement {
  static styles = css`
    :host {
      display: block;
      contain: initial;
      container-type: inline-size;
    }

    .demo {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(15rem, 20rem);
      grid-template-areas: 'icons filters';
      gap: var(--nve-ref-space-xl);
      align-items: start;
    }

    aside,
    form,
    .icons,
    .icon-tile,
    .preview,
    .preview-icon,
    .snippet {
      display: flex;
      flex-direction: column;
      gap: var(--nve-ref-space-md);
    }

    .icons {
      grid-area: icons;
      min-inline-size: 0;
    }

    aside {
      grid-area: filters;
      min-inline-size: 0;
      position: sticky;
      inset-block-start: var(--nve-ref-space-md);
      gap: var(--nve-ref-space-lg);
    }

    @container (width < 48rem) {
      .demo {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: 'filters' 'icons';
      }

      aside {
        position: static;
      }
    }

    .filter-options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
      gap: var(--nve-ref-space-sm);
    }

    .filter-toggles {
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      gap: var(--nve-ref-space-sm);
    }

    .catalog {
      display: grid;
      gap: var(--nve-ref-space-sm);
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 7rem), 1fr));
    }

    nve-button {
      --border-radius: var(--nve-ref-border-radius-sm);
      --height: 100px;
    }

    .icon-tile,
    .preview-icon {
      align-items: center;
    }

    .icon-tile {
      inline-size: 100%;
    }

    .preview {
      padding-block-start: var(--nve-ref-space-lg);
      border-block-start: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    }

    .preview-icon {
      gap: var(--nve-ref-space-sm);
    }

    .snippet,
    .snippet-heading {
      gap: var(--nve-ref-space-xs);
    }

    .snippet-heading {
      display: flex;
      align-items: center;
    }

    nve-codeblock {
      --background: var(--nve-sys-layer-canvas-background);
      --white-space: pre;
    }

    .catalog-title,
    .preview-title,
    .icon-name,
    .empty-message,
    .snippet-title {
      margin: 0;
      color: var(--nve-sys-text-color);
      font-family: var(--nve-ref-font-family);
      font-size: var(--nve-ref-font-size-200);
      font-weight: var(--nve-ref-font-weight-regular);
      line-height: var(--nve-ref-font-line-height-moderate);
      text-box: trim-both cap alphabetic;
      white-space: normal;
    }

    .catalog-title,
    .preview-title {
      font-size: var(--nve-ref-font-size-300);
    }

    .catalog-title a {
      color: var(--nve-sys-text-link-color);
      text-decoration: underline;
    }

    .catalog-title a:visited {
      color: var(--nve-sys-text-link-visited-color);
    }

    .catalog-title a:hover {
      color: var(--nve-sys-text-link-hover-color);
    }

    .icon-name,
    .preview-title {
      overflow-wrap: anywhere;
    }

    .icon-name,
    .empty-message {
      color: var(--nve-sys-text-muted-color);
    }

    .icon-name {
      font-size: var(--nve-ref-font-size-100);
      font-weight: var(--nve-ref-font-weight-light);
    }

    .snippet-title {
      font-weight: var(--nve-ref-font-weight-medium);
    }
  `;

  @state() private values = { gui: false, query: '', size: 'xl', outline: false, solid: false, direction: '' };
  @state() private selectedIcon?: CatalogIconName;

  #registeredGuiIcons = new Set<string>();
  #guiObserver = new IntersectionObserver(
    entries => {
      let visible = false;
      for (const { target, isIntersecting } of entries) {
        const name = target.getAttribute('data-gui-icon');
        if (isIntersecting && name) {
          this.#registerGuiIcon(name);
          visible = true;
        }
      }
      if (visible) this.requestUpdate();
    },
    { rootMargin: '240px' }
  );

  disconnectedCallback() {
    this.#guiObserver.disconnect();
    super.disconnectedCallback();
  }

  #preventSubmit = (event: Event) => event.preventDefault();

  render() {
    const { gui, solid, query } = this.values;
    const iconNames = gui ? GUI_ICON_NAMES : solid ? ICON_NAMES_SOLID : ICON_NAMES;
    const matches = iconNames.filter(name => name.includes(query));

    return html`
      <div class="demo">
        <aside aria-label="Icon catalog filters">
          ${this.#renderFilterForm()}
          ${this.#renderPreview()}
        </aside>
        <section class="icons">
          <h2 class="catalog-title">${!gui ? 'NVIDIA Elements Icons' : html`<a href="https://github.com/NVIDIA/icons">NVIDIA GUI Icons</a>`}</h2>
          <div class="catalog">
            ${matches.map(iconName => {
              const name = gui ? this.#guiRegistrationName(iconName) : iconName;
              const pending = gui && !this.#registeredGuiIcons.has(name);
              return html`
                <nve-button @click=${() => this.#selectIcon(iconName)} .pressed=${this.selectedIcon === iconName} data-gui-icon=${pending ? iconName : nothing} container="flat">
                  <div class="icon-tile">
                    <nve-icon aria-hidden="true" ?outline=${this.values.outline} .appearance=${solid ? 'solid' : undefined} .size=${this.values.size} .name=${pending ? undefined : name} .direction=${this.#getRotation(iconName, this.values.direction)}></nve-icon>
                    <h3 class="icon-name">${iconName}</h3>
                  </div>
                </nve-button>`;
            })}
          </div>
          ${matches.length === 0 ? html`<p class="empty-message">No icons match your search.</p>` : nothing}
        </section>
      </div>
    `;
  }

  #renderFilterForm() {
    return html`
      <form @input=${this.#readFilters} @submit=${this.#preventSubmit}>
        <nve-search>
          <label>Search Icons</label>
          <input type="search" name="query">
        </nve-search>
        <nve-select>
          <label>Icon Set</label>
          <select name="catalog" aria-label="Icon set">
            <option value="elements">NVIDIA Elements Icons</option>
            <option value="gui">NVIDIA GUI Icons</option>
          </select>
        </nve-select>
        <div class="filter-options">
          <nve-select>
            <label>Size</label>
            <select name="size">
              <option value="xs">XS</option>
              <option value="sm">SM</option>
              <option value="">MD</option>
              <option value="lg">LG</option>
              <option value="xl" selected>XL</option>
            </select>
          </nve-select>
          <nve-select>
            <label>Direction</label>
            <select name="direction">
              <option value="">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </nve-select>
        </div>
        <div class="filter-toggles">
          <nve-checkbox>
            <label>Solid icons</label>
            <input type="checkbox" name="solid">
          </nve-checkbox>
          <nve-checkbox>
            <label>Bounding box</label>
            <input type="checkbox" name="outline">
          </nve-checkbox>
        </div>
      </form>
    `;
  }

  #getRotation(iconName: string, direction: string) {
    return iconName.includes('arrow') ||
      iconName.includes('chevron') ||
      iconName.includes('caret') ||
      iconName.includes('thumb')
      ? direction
      : '';
  }

  #readFilters = (event: Event) => {
    if (!(event.currentTarget instanceof HTMLFormElement)) return;

    const formData = new FormData(event.currentTarget);
    const query = formData.get('query');
    const size = formData.get('size');
    const direction = formData.get('direction');
    const solid = formData.has('solid');
    const gui = formData.get('catalog') === 'gui';
    this.#updateCatalog({ gui, solid });
    this.values = {
      gui,
      query: typeof query === 'string' ? query : '',
      size: typeof size === 'string' ? size : '',
      outline: formData.has('outline'),
      solid,
      direction: typeof direction === 'string' ? direction : ''
    };
  };

  #updateCatalog({ gui, solid }: { gui: boolean; solid: boolean }) {
    const changedCatalog = gui !== this.values.gui;
    if (changedCatalog || (!gui && solid && !ICON_NAMES_SOLID.some(name => name === this.selectedIcon))) {
      this.selectedIcon = undefined;
    }
  }

  async #selectIcon(name: CatalogIconName) {
    this.selectedIcon = name;
    await this.updateComplete;
    const sidebar = this.renderRoot.querySelector('aside');
    const icons = this.renderRoot.querySelector('.icons');
    if (sidebar && icons && sidebar.getBoundingClientRect().bottom <= icons.getBoundingClientRect().top) {
      this.renderRoot.querySelector('#icon-catalog-preview')?.scrollIntoView({ block: 'nearest' });
    }
  }

  protected updated() {
    this.#guiObserver.disconnect();
    this.renderRoot.querySelectorAll('[data-gui-icon]').forEach(tile => this.#guiObserver.observe(tile));
  }

  #renderPreview() {
    const name = this.selectedIcon;
    if (!name) return nothing;

    const { gui, size, solid } = this.values;
    const registeredName = gui ? `nvidia-gui:${name}` : name;
    const previewName = gui ? this.#registerGuiIcon(name) : name;
    const direction = this.#getRotation(name, this.values.direction);
    const attributes = [
      `name="${registeredName}"`,
      solid && 'appearance="solid"',
      size && `size="${size}"`,
      direction && `direction="${direction}"`
    ]
      .filter(Boolean)
      .join(' ');
    const imports = this.#importCode(name, registeredName);
    const markup = `<nve-icon ${attributes}></nve-icon>`;

    return html`
      <section id="icon-catalog-preview" class="preview" aria-label="Icon preview">
        <div class="preview-icon">
          <nve-icon aria-hidden="true" .name=${previewName} .size=${size} .appearance=${solid ? 'solid' : undefined} .direction=${direction} ?outline=${this.values.outline}></nve-icon>
          <h3 class="preview-title">${name}</h3>
        </div>
        ${this.#snippet('Import', 'javascript', imports)}
        ${this.#snippet('HTML', 'html', markup)}
      </section>
    `;
  }

  #importCode(name: CatalogIconName, registeredName: string) {
    const asset = this.values.solid ? `${name}-solid` : name;
    if (!this.values.gui) {
      return `import '@nvidia-elements/core/icon/define.js';\nimport '@nvidia-elements/core/icon/icons/${asset}.js';`;
    }

    return `import { Icon } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';
import svg from '@nvidia/gui-icons/assets/${this.#guiVariant}/${name}.svg?raw';

await Icon.add({ '${this.values.solid ? `${registeredName}-solid` : registeredName}': svg });`;
  }

  get #guiVariant() {
    return this.values.solid ? 'fill' : 'line';
  }

  #guiRegistrationName(name: string): `nvidia-gui:${string}` {
    return `nvidia-gui:${name}${this.values.solid ? '-solid' : ''}`;
  }

  #registerGuiIcon(name: string) {
    const registeredName = this.#guiRegistrationName(name);
    if (this.#registeredGuiIcons.has(registeredName)) return registeredName;

    const svg = GUI_ICONS.get(`${this.#guiVariant}/${name}.svg`);
    if (!svg) throw new Error(`Unknown GUI icon: ${name}`);

    this.#registeredGuiIcons.add(registeredName);
    void Icon.add({ [registeredName]: { svg } });
    return registeredName;
  }

  #snippet(title: string, language: 'javascript' | 'html', source: string) {
    return html`
      <div class="snippet">
        <div class="snippet-heading">
          <h4 class="snippet-title">${title}</h4>
          <nve-copy-button aria-label=${`Copy ${title.toLowerCase()} snippet`} size="sm" container="flat" behavior-copy .value=${source}></nve-copy-button>
        </div>
        <nve-codeblock language=${language} .code=${source}></nve-codeblock>
      </div>
    `;
  }
}

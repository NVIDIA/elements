import { html, nothing, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { classMap } from 'lit/directives/class-map.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Button } from '@nvidia-elements/core/button';
import styles from './node.css?inline';

/**
 * @deprecated
 * @private
 */
export class JSONNode extends LitElement {
  @property({ type: Object }) value: any; // eslint-disable-line

  @property({ type: String }) prop: string;

  @property({ type: Boolean }) expanded = false;

  @property({ type: Boolean, attribute: 'expanded-all', reflect: true }) expandedAll: boolean;

  static readonly metadata = {
    tag: 'nve-json-node',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Button.metadata.tag]: Button,
    [IconButton.metadata.tag]: IconButton,
    [JSONNode.metadata.tag]: JSONNode
  };

  get #isArray() {
    return Array.isArray(this.value);
  }

  get #isObject() {
    return typeof this.value === 'object' && this.value !== null && !this.#isArray;
  }

  get #classMap() {
    return { array: this.#isArray, object: this.#isObject, expanded: this.expanded };
  }

  get #expandButton() {
    return this.prop
      ? html`<nve-button @click=${() => (this.expanded = !this.expanded)} container="flat">${this.prop}: </nve-button>`
      : html`<nve-icon-button @click=${() => (this.expanded = !this.expanded)} .direction=${this.expanded ? 'down' : 'right'} container="flat" size="sm" icon-name="caret"></nve-icon-button>`;
  }

  get #arrayNode() {
    return html`${this.value.filter(i => i !== null).map(value => html`<nve-json-node .value=${value} .expandedAll=${this.expandedAll}></nve-json-node>`)}`;
  }

  get #objectNode() {
    return html`${Object.entries(this.value).map(([k, v]) => html`<nve-json-node .prop=${k} .value=${v} .expandedAll=${this.expandedAll}></nve-json-node>`)}`;
  }

  get #value() {
    return html`
    <div class="value">
      <span class="label">${this.prop ? html`${this.prop}:&nbsp;` : nothing}</span> ${this.#getValue(this.value)}<span class="comma">,</span>
    </div>`;
  }

  static styles = useStyles([styles]);

  render() {
    return html`<div class=${classMap(this.#classMap)}>
    ${
      this.#isArray || this.#isObject
        ? html`
        ${this.#expandButton}
        ${this.expanded && this.#isArray ? this.#arrayNode : nothing}
        ${this.expanded && this.#isObject ? this.#objectNode : nothing}`
        : this.#value
    }
    </div>`;
  }

  async updated(props) {
    super.updated(props);
    await this.updateComplete;
    if (props.has('expandedAll') && this.expandedAll) {
      // JSON viewer is readonly display so no state control or side effects allowed
      this.expanded = true; // eslint-disable-line
    }
  }

  #getValue(value) {
    if (typeof value === 'string' && value.startsWith('http')) {
      return html`<a href=${value} target="_blank">${value}</a>`;
    } else if (typeof value === 'string' && value.length > 100) {
      return html`<pre>${value}</pre>`;
    } else {
      return html`<div>${value}</div>`;
    }
  }
}

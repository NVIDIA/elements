import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { classMap } from 'lit/directives/class-map.js';
import { useStyles } from '@elements/elements/internal';
import { JSONNode } from './node/node.js';
import styles from './json-viewer.css?inline';

/**
 * @element mlv-json-viewer
 * @description The JSON Viewer is a custom element that renders JSON data in a easy to read format. This can be used for prototyping and quickly displaying and debugging data. The JSON View is not a substitute for treeview patterns.
 * @since 0.16.0
 * @slot - default slot for json
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/developer-tools-json-viewer-documentation--docs
 * @figma false
 * @stable false
 */
export class JSONViewer extends LitElement {
  /** JSON value to be displayed */
  @property({ type: Object }) value = {}; // eslint-disable-line

  /** expand all nodes */
  @property({ type: Boolean }) expanded: boolean;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-json-viewer',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    [JSONNode.metadata.tag]: JSONNode
  };

  get #classMap() {
    return {
      array: Array.isArray(this.value),
      object: typeof this.value === 'object' && this.value !== null,
      expanded: this.expanded
    };
  }

  render() {
    return html`
    <div class=${classMap(this.#classMap)}>
      <slot @slotchange=${this.#slotchange} hidden></slot>
      ${Object.entries(this.value)
        .filter(v => v[1] !== null)
        .map(
          ([prop, value]) =>
            html`<mlv-json-node .expanded=${this.expanded} .expandedAll=${this.expanded} .prop=${prop} .value=${value}></mlv-json-node>`
        )}
    </div>
    `;
  }

  #slotchange() {
    this.value = JSON.parse(this.textContent);
  }
}

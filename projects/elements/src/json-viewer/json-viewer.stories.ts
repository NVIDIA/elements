import { html, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import { define } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/json-viewer/define.js';


export default {
  title: 'Internal/JSON Viewer/Examples',
  component: 'nve-json-viewer',
};

const json = {"tasks": [{ "id": 1, "status": "success", "date": "08/03/2023 14:22:44", "url": "https://elements.nvidia.com/av/ingestion/uploads", "message": "task completed" },{ "id": 2, "status": "failed", "date": "08/09/2023 14:22:44", "url": "https://elements.nvidia.com/av/ingestion/uploads", "message": "Error: cy.request() failed on:\n\nThe response we received from your web server was:\n\n  > 401: Unauthorized\n" }]};

export const Default = {
  render: () => html`
  <nve-json-viewer expanded>${JSON.stringify(json)}</nve-json-viewer>
  `
};

class DyanamicJSONDemo extends LitElement {
  @state() metrics = {};

  static metadata = {
    tag: 'dynamic-json-demo',
    version: 'demo'
  }

  async connectedCallback() {
    super.connectedCallback();
    this.metrics = await import('../../../internals/metadata/dist/index.json');
  }

  render() {
    return html`<nve-json-viewer .value=${this.metrics}></nve-json-viewer>`
  }
}

define(DyanamicJSONDemo)


export const Dynamic = {
  render: () => html`
  <dynamic-json-demo></dynamic-json-demo>
  `
};

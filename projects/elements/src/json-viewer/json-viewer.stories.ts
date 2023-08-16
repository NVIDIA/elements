import { html, LitElement } from 'lit';
import { define } from '@elements/elements/internal';
import '@elements/elements/json-viewer/define.js';
import metrics from 'metrics/data.json';

export default {
  title: 'Internal/JSON Viewer/Examples',
  component: 'mlv-json-viewer',
};

const json = {"tasks": [{ "id": 1, "status": "success", "date": "08/03/2023 14:22:44", "url": "https://elements.nvidia.com/av/ingestion/uploads", "message": "task completed" },{ "id": 2, "status": "failed", "date": "08/09/2023 14:22:44", "url": "https://elements.nvidia.com/av/ingestion/uploads", "message": "Error: cy.request() failed on:\n\nThe response we received from your web server was:\n\n  > 401: Unauthorized\n" }]};

export const Default = {
  render: () => html`
  <mlv-json-viewer expanded>${JSON.stringify(json)}</mlv-json-viewer>
  `
};

class DyanamicJSONDemo extends LitElement {
  static metadata = {
    tag: 'dynamic-json-demo',
    version: 'demo'
  }

  render() {
    return html`<mlv-json-viewer .value=${metrics}></mlv-json-viewer>`
  }
}

define(DyanamicJSONDemo)


export const Dynamic = {
  render: () => html`
  <dynamic-json-demo></dynamic-json-demo>
  `
};

import { html } from 'lit';
import '@nvidia-elements/core/json-viewer/define.js';

export default {
  title: 'Internal/JSON Viewer/Examples',
  component: 'nve-json-viewer',
};

export const Default = {
  render: () => html`
  <nve-json-viewer expanded>${JSON.stringify({"tasks": [{ "id": 1, "status": "success", "date": "08/03/2023 14:22:44", "url": "https://elements.nvidia.com/av/ingestion/uploads", "message": "task completed" },{ "id": 2, "status": "failed", "date": "08/09/2023 14:22:44", "url": "https://elements.nvidia.com/av/ingestion/uploads", "message": "Error: cy.request() failed on:\n\nThe response we received from your web server was:\n\n  > 401: Unauthorized\n" }]})}</nve-json-viewer>
  `
};

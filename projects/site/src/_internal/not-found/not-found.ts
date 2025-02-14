import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import '@nvidia-elements/core/alert/define.js';

// basic test element displayed on the 404 page
@customElement('nvd-not-found')
export class NotFound extends LitElement {
  render() {
    return html`
      <nve-alert status="danger">Not Found</nve-alert>
    `;
  }
}

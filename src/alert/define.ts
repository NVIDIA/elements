import { Alert } from './alert.js';
import { AlertGroup } from './alert-group.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';

customElements.get('mlv-alert') || customElements.define('mlv-alert', Alert);
customElements.get('mlv-alert-group') || customElements.define('mlv-alert-group', AlertGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-alert': Alert;
    'mlv-alert-group': AlertGroup;
  }
}

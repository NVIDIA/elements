import { Alert } from './alert.js';
import { AlertGroup } from './alert-group.js';
import '@elements/elements/icon/define.js';

customElements.get('nve-alert') || customElements.define('nve-alert', Alert);
customElements.get('nve-alert-group') || customElements.define('nve-alert-group', AlertGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
  }
}

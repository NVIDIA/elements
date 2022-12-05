import { Alert, AlertGroup } from '@elements/elements/alert';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/icon/define.js';

customElements.get('nve-alert') || customElements.define('nve-alert', Alert);
customElements.get('nve-alert-group') || customElements.define('nve-alert-group', AlertGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
  }
}

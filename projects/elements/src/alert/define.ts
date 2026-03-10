import { Alert, AlertGroup, AlertBanner } from '@nvidia-elements/core/alert';
import { define } from '@nvidia-elements/core/internal';

define(Alert);
define(AlertGroup);
define(AlertBanner);

declare global {
  interface HTMLElementTagNameMap {
    'nve-alert': Alert;
    'nve-alert-group': AlertGroup;
  }
}

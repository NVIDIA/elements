import { define } from '@elements/elements/internal';
import { BulkActions } from '@elements/elements/bulk-actions';
import '@elements/elements/icon/define.js';

define(BulkActions);

declare global {
  interface HTMLElementTagNameMap {
    'nve-bulk-actions': BulkActions;
  }
}

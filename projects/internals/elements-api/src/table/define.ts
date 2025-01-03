import { define } from '@nvidia-elements/core/internal';
import { Table } from './table.js';
import '@nvidia-elements/core/tag/define.js';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/icon/define.js';

define(Table);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-table': Table;
  }
}

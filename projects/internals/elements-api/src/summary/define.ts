import { define } from '@nvidia-elements/core/internal';
import { Summary } from './summary.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/button/define.js';
import '../badge-axe/define.js';
import '../badge-bundle/define.js';
import '../badge-coverage/define.js';
import '../badge-lighthouse/define.js';
import '../badge-status/define.js';

define(Summary);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-summary': Summary;
  }
}

import { define } from '@nvidia-elements/core/internal';
import { BadgeStatus } from './badge-status.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/badge/define.js';

define(BadgeStatus);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-badge-status': BadgeStatus;
  }
}

import { define } from '@nvidia-elements/core/internal';
import { Detail } from './detail.js';

define(Detail);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-detail': Detail;
  }
}

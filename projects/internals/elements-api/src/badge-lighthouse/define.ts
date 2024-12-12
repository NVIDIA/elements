import { define } from '@nvidia-elements/core/internal';
import { BadgeLighthouse } from './badge-lighthouse.js';

define(BadgeLighthouse);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-badge-lighthouse': BadgeLighthouse;
  }
}

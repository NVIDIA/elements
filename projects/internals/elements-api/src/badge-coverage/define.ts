import { define } from '@nvidia-elements/core/internal';
import { BadgeCoverage } from './badge-coverage.js';
import '@nvidia-elements/core/badge/define.js';

define(BadgeCoverage);

declare global {
  interface HTMLElementTagNameMap {
    'nve-api-badge-coverage': BadgeCoverage;
  }
}

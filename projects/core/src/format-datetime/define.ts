import { define } from '@nvidia-elements/core/internal';
import { FormatDatetime } from '@nvidia-elements/core/format-datetime';

define(FormatDatetime);

declare global {
  interface HTMLElementTagNameMap {
    'nve-format-datetime': FormatDatetime;
  }
}

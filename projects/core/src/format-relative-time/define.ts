import { define } from '@nvidia-elements/core/internal';
import { FormatRelativeTime } from '@nvidia-elements/core/format-relative-time';

define(FormatRelativeTime);

declare global {
  interface HTMLElementTagNameMap {
    'nve-format-relative-time': FormatRelativeTime;
  }
}

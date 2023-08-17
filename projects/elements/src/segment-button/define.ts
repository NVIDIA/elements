import { define } from '@elements/elements/internal';
import { SegmentButton } from '@elements/elements/segment-button';

define(SegmentButton);

declare global {
  interface HTMLElementTagNameMap {
    'nve-segment-button': SegmentButton;
  }
}

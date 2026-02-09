import { html } from 'lit';
import '@nvidia-elements/core/skeleton/define.js';

export default {
  title: 'Elements/Skeleton',
  component: 'nve-skeleton',
};

/**
 * @summary Basic skeleton component for text content. Shows placeholder lines while content loads.
 */
export const Default = {
  render: () => html`
<div nve-layout="column gap:xs align:stretch">
  <nve-skeleton></nve-skeleton>
  <nve-skeleton style="width: 90%"></nve-skeleton>
  <nve-skeleton style="width: 80%"></nve-skeleton>
</div>`
};

/**
 * @summary Effects that can be applied to the skeleton.
 */
export const Effect = {
  render: () => html`
<div nve-layout="column gap:xs align:stretch">
  <nve-skeleton></nve-skeleton>
  <nve-skeleton effect="pulse"></nve-skeleton>
  <nve-skeleton effect="shimmer"></nve-skeleton>
</div>`
}

/**
 * @summary Shapes that can be applied to the skeleton.
 */
export const Shape = {
  render: () => html`
<div nve-layout="column gap:xs align:stretch">
  <nve-skeleton></nve-skeleton>
  <nve-skeleton shape="pill"></nve-skeleton>
  <nve-skeleton shape="round" style="width: 40px; height: 40px;"></nve-skeleton>
</div>`
}

/**
 * @summary Slotting content will hide the skeleton.
 */
export const Slotted = {
  render: () => html`
<div nve-layout="column gap:xs align:stretch">
  <nve-skeleton></nve-skeleton>
  <nve-skeleton effect="shimmer">slotting content will hide the skeleton</nve-skeleton>
  <nve-skeleton effect="shimmer">  </nve-skeleton>
</div>`
}

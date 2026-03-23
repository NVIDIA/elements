import { html } from 'lit';
import '@nvidia-elements/core/progress-ring/define.js';

export default {
  title: 'Elements/Progress Ring',
  component: 'nve-progress-ring',
};

/**
 * @summary Circular progress indicators showing indeterminate loading state and determinate completion progress.
 */
export const Default = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="accent"></nve-progress-ring>
  
      <nve-progress-ring status="accent" value="66"></nve-progress-ring>
    </div>
`};

/**
 * @summary Progress rings displaying completion percentages from indeterminate to 0%, 33%, 66%, and 100%.
 * @tags test-case
 */
export const Values = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="accent"></nve-progress-ring>

      <nve-progress-ring status="accent" value="0"></nve-progress-ring>

      <nve-progress-ring status="accent" value="33"></nve-progress-ring>

      <nve-progress-ring status="accent" value="66"></nve-progress-ring>

      <nve-progress-ring status="accent" value="100"></nve-progress-ring>
    </div>
`};

/**
 * @summary Progress rings with custom max values for proportional progress within a defined scale.
 * @tags test-case
 */
export const Max = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="accent" max="20" value="5"></nve-progress-ring>

      <nve-progress-ring status="accent" max="20" value="10"></nve-progress-ring>
      
      <nve-progress-ring status="accent" max="20" value="15"></nve-progress-ring>
    </div>
`};

/**
 * @summary Progress rings with warning and danger status colors for indicating critical or cautionary states.
 */
export const Status = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="warning" value="75"></nve-progress-ring>

      <nve-progress-ring status="danger" value="75"></nve-progress-ring>

      <nve-progress-ring status="warning"></nve-progress-ring>

      <nve-progress-ring status="danger"></nve-progress-ring>
    </div>
`};

/**
 * @summary Progress ring paired inline with descriptive text label for communicating loading state.
 */
export const WithText = {
  render: () => html`
    <div nve-layout="row gap:xs align:vertical-center" nve-text="medium">
      <nve-progress-ring status="accent" size="xs" aria-labelledby="processing-label"></nve-progress-ring>
      <span id="processing-label">Processing...</span>
    </div>
`};

/**
 * @summary Progress ring with custom status icon slotted in the center for enhanced visual communication.
 * @tags test-case
 */
export const SlottedIcon = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="accent">
        <nve-icon name="pause" status="accent"></nve-icon>
      </nve-progress-ring>
    </div>
`};

/**
 * @summary Progress rings in many sizes from extra-extra-small to extra-large for different UI contexts.
 * @tags test-case
 */
export const Sizing = {
  render: () => html`
    <div nve-layout="row gap:sm pad:md">
      <nve-progress-ring status="accent" size="xxs"></nve-progress-ring>
      <nve-progress-ring status="accent" size="xs"></nve-progress-ring>
      <nve-progress-ring status="accent" size="sm"></nve-progress-ring>
      <nve-progress-ring status="accent" size="md"></nve-progress-ring>
      <nve-progress-ring status="accent" size="lg"></nve-progress-ring>
      <nve-progress-ring status="accent" size="xl"></nve-progress-ring>
    </div>

    <div nve-layout="row gap:sm pad:md">
      <nve-progress-ring status="danger" size="xxs"></nve-progress-ring>
      <nve-progress-ring status="danger" size="xs"></nve-progress-ring>
      <nve-progress-ring status="danger" size="sm"></nve-progress-ring>
      <nve-progress-ring status="danger" size="md"></nve-progress-ring>
      <nve-progress-ring status="danger" size="lg"></nve-progress-ring>
    </div>
`};

/**
 * @summary Progress rings integrated within buttons to show loading states during actions and operations.
 */
export const WithButton = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-button>
        <nve-progress-ring status="neutral" size="xxs"></nve-progress-ring>
        Button
      </nve-button>

      <nve-button interaction="emphasis">
        <nve-progress-ring status="neutral" size="xxs"></nve-progress-ring>
        Button
      </nve-button>

      <nve-button interaction="destructive">
        <nve-progress-ring status="neutral" size="xxs"></nve-progress-ring>
        Button
      </nve-button>

      <nve-button>
        <nve-progress-ring status="neutral" size="xxs" value="33"></nve-progress-ring>
        Button
      </nve-button>

      <nve-button interaction="emphasis">
        <nve-progress-ring status="neutral" size="xxs" value="33"></nve-progress-ring>
        Button
      </nve-button>

      <nve-button interaction="destructive">
        <nve-progress-ring status="neutral" size="xxs" value="33"></nve-progress-ring>
        Button
      </nve-button>
    </div>
`};
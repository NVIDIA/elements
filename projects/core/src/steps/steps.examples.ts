import { html } from 'lit';
import '@nvidia-elements/core/steps/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Steps',
  component: 'nve-steps',
};

/**
 * @summary Interactive step indicator with status colors for multi-step workflows. Use for wizards, onboarding flows, or process tracking where users can navigate between steps.
 */
export const Default = {
  render: () => html`
  <nve-steps behavior-select>
    <nve-steps-item status="success">Step 1</nve-steps-item>
    <nve-steps-item status="danger">Step 2</nve-steps-item>
    <nve-steps-item selected>Step 3</nve-steps-item>
    <nve-steps-item status="pending">Step 4</nve-steps-item>
    <nve-steps-item disabled>Disabled</nve-steps-item>
  </nve-steps>
  `
};

/**
 * @summary Condensed step indicator with reduced visual weight. Ideal for space-constrained layouts or secondary navigation where steps need less prominence.
 */
export const Condensed = {
  render: () => html`
  <nve-steps behavior-select container="condensed">
    <nve-steps-item status="success">Step 1</nve-steps-item>
    <nve-steps-item status="danger">Step 2</nve-steps-item>
    <nve-steps-item selected>Step 3</nve-steps-item>
    <nve-steps-item status="pending">Step 4</nve-steps-item>
    <nve-steps-item disabled>Disabled</nve-steps-item>
  </nve-steps>
  `
};

/**
 * @summary Vertical step layout for sidebar navigation or tall containers. Use when horizontal space constrains layout or steps require longer labels.
 */
export const VerticalSteps = {
  render: () => html`
  <nve-steps vertical behavior-select style="width: 150px">
    <nve-steps-item selected>Step 1</nve-steps-item>
    <nve-steps-item>Step 2</nve-steps-item>
    <nve-steps-item>Step 3</nve-steps-item>
    <nve-steps-item disabled>Disabled</nve-steps-item>
    <nve-steps-item>Step 5</nve-steps-item>
  </nve-steps>
  `
};

/**
 * @summary Vertical condensed steps combining both layout options. Ideal for dense sidebar navigation with minimal visual footprint.
 */
export const VerticalCondensedSteps = {
  render: () => html`
  <nve-steps vertical container="condensed" behavior-select>
    <nve-steps-item selected>Step 1</nve-steps-item>
    <nve-steps-item>Step 2</nve-steps-item>
    <nve-steps-item>Step 3</nve-steps-item>
    <nve-steps-item disabled>Disabled</nve-steps-item>
    <nve-steps-item>Step 5</nve-steps-item>
  </nve-steps>
  `
};

/**
 * @summary Display-only steps without interactive selection behavior. Use for showing progress indicators where external logic controls step navigation.
 */
export const StatelessSteps = {
  render: () => html`
  <nve-steps>
    <nve-steps-item selected>Step 1</nve-steps-item>
    <nve-steps-item>Step 2</nve-steps-item>
    <nve-steps-item>Step 3</nve-steps-item>
    <nve-steps-item>Step 4</nve-steps-item>
    <nve-steps-item disabled>Disabled</nve-steps-item>
  </nve-steps>
  `
};

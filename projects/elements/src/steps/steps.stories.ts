import { html } from 'lit';
import '@nvidia-elements/core/steps/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Steps/Examples',
  component: 'mlv-steps',
};

export const Default = {
  render: () => html`
  <mlv-steps behavior-select>
    <mlv-steps-item status="success">Step 1</mlv-steps-item>
    <mlv-steps-item status="danger">Step 2</mlv-steps-item>
    <mlv-steps-item selected>Step 3</mlv-steps-item>
    <mlv-steps-item status="pending">Step 4</mlv-steps-item>
    <mlv-steps-item disabled>Disabled</mlv-steps-item>
  </mlv-steps>
  `
};

export const Condensed = {
  render: () => html`
  <mlv-steps behavior-select container="condensed">
    <mlv-steps-item status="success">Step 1</mlv-steps-item>
    <mlv-steps-item status="danger">Step 2</mlv-steps-item>
    <mlv-steps-item selected>Step 3</mlv-steps-item>
    <mlv-steps-item status="pending">Step 4</mlv-steps-item>
    <mlv-steps-item disabled>Disabled</mlv-steps-item>
  </mlv-steps>
  `
};

export const VerticalSteps = {
  render: () => html`
  <mlv-steps vertical behavior-select style="width: 150px">
    <mlv-steps-item selected>Step 1</mlv-steps-item>
    <mlv-steps-item>Step 2</mlv-steps-item>
    <mlv-steps-item>Step 3</mlv-steps-item>
    <mlv-steps-item disabled>Disabled</mlv-steps-item>
    <mlv-steps-item>Step 5</mlv-steps-item>
  </mlv-steps>
  `
};

export const VerticalCondensedSteps = {
  render: () => html`
  <mlv-steps vertical container="condensed" behavior-select>
    <mlv-steps-item selected>Step 1</mlv-steps-item>
    <mlv-steps-item>Step 2</mlv-steps-item>
    <mlv-steps-item>Step 3</mlv-steps-item>
    <mlv-steps-item disabled>Disabled</mlv-steps-item>
    <mlv-steps-item>Step 5</mlv-steps-item>
  </mlv-steps>
  `
};

export const StatelessSteps = {
  render: () => html`
  <mlv-steps>
    <mlv-steps-item selected>Step 1</mlv-steps-item>
    <mlv-steps-item>Step 2</mlv-steps-item>
    <mlv-steps-item>Step 3</mlv-steps-item>
    <mlv-steps-item>Step 4</mlv-steps-item>
    <mlv-steps-item disabled>Disabled</mlv-steps-item>
  </mlv-steps>
  `
};

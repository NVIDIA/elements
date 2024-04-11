import { html } from 'lit';
import '@nvidia-elements/core/stepper/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Stepper/Examples',
  component: 'mlv-stepper',
};

export const Default = {
  render: () => html`
  <mlv-stepper behavior-select>
    <mlv-stepper-item status="success">Step 1</mlv-stepper-item>
    <mlv-stepper-item status="danger">Step 2</mlv-stepper-item>
    <mlv-stepper-item selected>Step 3</mlv-stepper-item>
    <mlv-stepper-item status="pending">Step 4</mlv-stepper-item>
    <mlv-stepper-item disabled>Disabled</mlv-stepper-item>
  </mlv-stepper>
  `
};

export const Condensed = {
  render: () => html`
  <mlv-stepper behavior-select container="condensed">
    <mlv-stepper-item status="success">Step 1</mlv-stepper-item>
    <mlv-stepper-item status="danger">Step 2</mlv-stepper-item>
    <mlv-stepper-item selected>Step 3</mlv-stepper-item>
    <mlv-stepper-item status="pending">Step 4</mlv-stepper-item>
    <mlv-stepper-item disabled>Disabled</mlv-stepper-item>
  </mlv-stepper>
  `
};

export const VerticalStepper = {
  render: () => html`
  <mlv-stepper vertical behavior-select style="width: 150px">
    <mlv-stepper-item selected>Step 1</mlv-stepper-item>
    <mlv-stepper-item>Step 2</mlv-stepper-item>
    <mlv-stepper-item>Step 3</mlv-stepper-item>
    <mlv-stepper-item disabled>Disabled</mlv-stepper-item>
    <mlv-stepper-item>Step 5</mlv-stepper-item>
  </mlv-stepper>
  `
};

export const VerticalCondensedStepper = {
  render: () => html`
  <mlv-stepper vertical container="condensed" behavior-select>
    <mlv-stepper-item selected>Step 1</mlv-stepper-item>
    <mlv-stepper-item>Step 2</mlv-stepper-item>
    <mlv-stepper-item>Step 3</mlv-stepper-item>
    <mlv-stepper-item disabled>Disabled</mlv-stepper-item>
    <mlv-stepper-item>Step 5</mlv-stepper-item>
  </mlv-stepper>
  `
};

export const StatelessStepper = {
  render: () => html`
  <mlv-stepper>
    <mlv-stepper-item selected>Step 1</mlv-stepper-item>
    <mlv-stepper-item>Step 2</mlv-stepper-item>
    <mlv-stepper-item>Step 3</mlv-stepper-item>
    <mlv-stepper-item>Step 4</mlv-stepper-item>
    <mlv-stepper-item disabled>Disabled</mlv-stepper-item>
  </mlv-stepper>
  `
};

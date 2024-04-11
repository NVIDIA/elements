import { html } from 'lit';
import '@nvidia-elements/core/stepper/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Stepper/Examples',
  component: 'nve-stepper',
};

export const Default = {
  render: () => html`
  <nve-stepper behavior-select>
    <nve-stepper-item status="success">Step 1</nve-stepper-item>
    <nve-stepper-item status="danger">Step 2</nve-stepper-item>
    <nve-stepper-item selected>Step 3</nve-stepper-item>
    <nve-stepper-item status="pending">Step 4</nve-stepper-item>
    <nve-stepper-item disabled>Disabled</nve-stepper-item>
  </nve-stepper>
  `
};

export const Condensed = {
  render: () => html`
  <nve-stepper behavior-select container="condensed">
    <nve-stepper-item status="success">Step 1</nve-stepper-item>
    <nve-stepper-item status="danger">Step 2</nve-stepper-item>
    <nve-stepper-item selected>Step 3</nve-stepper-item>
    <nve-stepper-item status="pending">Step 4</nve-stepper-item>
    <nve-stepper-item disabled>Disabled</nve-stepper-item>
  </nve-stepper>
  `
};

export const VerticalStepper = {
  render: () => html`
  <nve-stepper vertical behavior-select style="width: 150px">
    <nve-stepper-item selected>Step 1</nve-stepper-item>
    <nve-stepper-item>Step 2</nve-stepper-item>
    <nve-stepper-item>Step 3</nve-stepper-item>
    <nve-stepper-item disabled>Disabled</nve-stepper-item>
    <nve-stepper-item>Step 5</nve-stepper-item>
  </nve-stepper>
  `
};

export const VerticalCondensedStepper = {
  render: () => html`
  <nve-stepper vertical container="condensed" behavior-select>
    <nve-stepper-item selected>Step 1</nve-stepper-item>
    <nve-stepper-item>Step 2</nve-stepper-item>
    <nve-stepper-item>Step 3</nve-stepper-item>
    <nve-stepper-item disabled>Disabled</nve-stepper-item>
    <nve-stepper-item>Step 5</nve-stepper-item>
  </nve-stepper>
  `
};

export const StatelessStepper = {
  render: () => html`
  <nve-stepper>
    <nve-stepper-item selected>Step 1</nve-stepper-item>
    <nve-stepper-item>Step 2</nve-stepper-item>
    <nve-stepper-item>Step 3</nve-stepper-item>
    <nve-stepper-item>Step 4</nve-stepper-item>
    <nve-stepper-item disabled>Disabled</nve-stepper-item>
  </nve-stepper>
  `
};

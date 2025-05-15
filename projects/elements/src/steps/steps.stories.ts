import { html } from 'lit';
import '@nvidia-elements/core/steps/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/icon/define.js';

export default {
  title: 'Elements/Steps',
  component: 'nve-steps',
};

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

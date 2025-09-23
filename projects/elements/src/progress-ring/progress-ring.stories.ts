import { html } from 'lit';
import '@nvidia-elements/core/progress-ring/define.js';

export default {
  title: 'Elements/Progress Ring',
  component: 'nve-progress-ring',
};

export const Default = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="accent"></nve-progress-ring>
  
      <nve-progress-ring status="accent" value="66"></nve-progress-ring>
    </div>
`};

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

export const Max = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="accent" max="20" value="5"></nve-progress-ring>

      <nve-progress-ring status="accent" max="20" value="10"></nve-progress-ring>
      
      <nve-progress-ring status="accent" max="20" value="15"></nve-progress-ring>
    </div>
`};
    
export const Status = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="warning" value="75"></nve-progress-ring>

      <nve-progress-ring status="danger" value="75"></nve-progress-ring>

      <nve-progress-ring status="warning"></nve-progress-ring>

      <nve-progress-ring status="danger"></nve-progress-ring>
    </div>
`};
    
export const ZeroValueStatus = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="success" value="0"></nve-progress-ring>

      <nve-progress-ring status="warning" value="0"></nve-progress-ring>

      <nve-progress-ring status="danger" value="0"></nve-progress-ring>
    </div>
`};
    
export const WithText = {
  render: () => html`
    <div nve-layout="column gap:sm" nve-text="medium">
      <div nve-layout="row gap:xs align:center">
        <nve-progress-ring size="xs" status="success" value="0"></nve-progress-ring>
        Loading Successful
      </div>

      <div nve-layout="row gap:xs align:center">
        <nve-progress-ring size="xs" status="warning" value="0"></nve-progress-ring>
        Loading Timeout
      </div>

      <div nve-layout="row gap:xs align:center">
        <nve-progress-ring size="xs" status="danger" value="0"></nve-progress-ring>
        Loading Error
      </div>

      <div nve-layout="row gap:xs align:center">
        <nve-progress-ring status="accent" size="xs"></nve-progress-ring>
        Active Loading
      </div>
    </div>
`};
    
export const SlottedIcon = {
  render: () => html`
    <div nve-layout="row gap:sm">
      <nve-progress-ring status="accent">
        <nve-icon name="pause" status="accent" slot="status-icon"></nve-icon>
      </nve-progress-ring>
    </div>
`};
    
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
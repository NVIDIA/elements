import { html } from 'lit';
import '@nvidia-elements/core/progress-ring/define.js';

export default {
  title: 'Elements/Progress Ring/Examples',
  component: 'mlv-progress-ring',
};

export const Default = {
  render: () => html`
    <div mlv-layout="row gap:sm pad:md">
      <mlv-progress-ring status="accent"></mlv-progress-ring>
  
      <mlv-progress-ring status="accent" value="66"></mlv-progress-ring>
    </div>
`};

export const Values = {
  render: () => html`
    <div mlv-layout="row gap:sm pad:md">
      <mlv-progress-ring status="accent"></mlv-progress-ring>

      <mlv-progress-ring status="accent" value="0"></mlv-progress-ring>

      <mlv-progress-ring status="accent" value="33"></mlv-progress-ring>

      <mlv-progress-ring status="accent" value="66"></mlv-progress-ring>

      <mlv-progress-ring status="accent" value="100"></mlv-progress-ring>
    </div>
`};

export const Max = {
  render: () => html`
    <div mlv-layout="row gap:sm pad:md">
      <mlv-progress-ring status="accent" max="20" value="5"></mlv-progress-ring>

      <mlv-progress-ring status="accent" max="20" value="10"></mlv-progress-ring>
      
      <mlv-progress-ring status="accent" max="20" value="15"></mlv-progress-ring>
    </div>
`};
    
export const Status = {
  render: () => html`
    <div mlv-layout="row gap:sm pad:md">
      <mlv-progress-ring status="warning" value="75"></mlv-progress-ring>

      <mlv-progress-ring status="danger" value="75"></mlv-progress-ring>

      <mlv-progress-ring status="warning"></mlv-progress-ring>

      <mlv-progress-ring status="danger"></mlv-progress-ring>
    </div>
`};
    
export const ZeroValueStatus = {
  render: () => html`
    <div mlv-layout="row gap:sm pad:md">
      <mlv-progress-ring status="success" value="0"></mlv-progress-ring>

      <mlv-progress-ring status="warning" value="0"></mlv-progress-ring>

      <mlv-progress-ring status="danger" value="0"></mlv-progress-ring>
    </div>
`};
    
export const WithText = {
  render: () => html`
    <div mlv-layout="column gap:sm pad:md" mlv-text="medium">
      <div mlv-layout="row gap:xs align:center">
        <mlv-progress-ring size="xs" status="success" value="0"></mlv-progress-ring>
        Loading Successful
      </div>

      <div mlv-layout="row gap:xs align:center">
        <mlv-progress-ring size="xs" status="warning" value="0"></mlv-progress-ring>
        Loading Timeout
      </div>

      <div mlv-layout="row gap:xs align:center">
        <mlv-progress-ring size="xs" status="danger" value="0"></mlv-progress-ring>
        Loading Error
      </div>

      <div mlv-layout="row gap:xs align:center">
        <mlv-progress-ring status="accent" size="xs"></mlv-progress-ring>
        Active Loading
      </div>
    </div>
`};
    
export const SlottedIcon = {
  render: () => html`
    <div mlv-layout="row gap:sm pad:md">
      <mlv-progress-ring status="accent">
        <mlv-icon name="pause" status="accent" slot="status-icon"></mlv-icon>
      </mlv-progress-ring>
    </div>
`};
    
export const Sizing = {
  render: () => html`
    <div mlv-layout="row gap:sm pad:md">
      <mlv-progress-ring status="accent" size="xxs"></mlv-progress-ring>
      <mlv-progress-ring status="accent" size="xs"></mlv-progress-ring>
      <mlv-progress-ring status="accent" size="sm"></mlv-progress-ring>
      <mlv-progress-ring status="accent" size="md"></mlv-progress-ring>
      <mlv-progress-ring status="accent" size="lg"></mlv-progress-ring>
      <mlv-progress-ring status="accent" size="xl"></mlv-progress-ring>
    </div>

    <div mlv-layout="row gap:sm pad:md">
      <mlv-progress-ring status="danger" size="xxs"></mlv-progress-ring>
      <mlv-progress-ring status="danger" size="xs"></mlv-progress-ring>
      <mlv-progress-ring status="danger" size="sm"></mlv-progress-ring>
      <mlv-progress-ring status="danger" size="md"></mlv-progress-ring>
      <mlv-progress-ring status="danger" size="lg"></mlv-progress-ring>
    </div>
`};
    
export const WithButton = {
  render: () => html`
    <div mlv-layout="row gap:sm pad:md">
      <mlv-button>
        <mlv-progress-ring status="neutral" size="xxs"></mlv-progress-ring>
        Button
      </mlv-button>

      <mlv-button interaction="emphasis">
        <mlv-progress-ring status="neutral" size="xxs"></mlv-progress-ring>
        Button
      </mlv-button>

      <mlv-button interaction="destructive">
        <mlv-progress-ring status="neutral" size="xxs"></mlv-progress-ring>
        Button
      </mlv-button>

      <mlv-button>
        <mlv-progress-ring status="neutral" size="xxs" value="33"></mlv-progress-ring>
        Button
      </mlv-button>

      <mlv-button interaction="emphasis">
        <mlv-progress-ring status="neutral" size="xxs" value="33"></mlv-progress-ring>
        Button
      </mlv-button>

      <mlv-button interaction="destructive">
        <mlv-progress-ring status="neutral" size="xxs" value="33"></mlv-progress-ring>
        Button
      </mlv-button>
    </div>
`};
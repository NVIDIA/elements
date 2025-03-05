import { html } from 'lit';
import '@nvidia-elements/core/star-rating/define.js';
import '@nvidia-elements/core/forms/define.js';

export default {
  title: 'Elements/Star Rating/Examples',
  component: 'nve-star-rating'
};

export const Default = {
  render: () => html`
  <nve-star-rating>
    <label>rate this input</label>
    <input id="range" type="range" max="5" value="3" min="0" />
    <nve-control-message>message</nve-control-message>
  </nve-star-rating>`
};

export const Disabled = {
  render: () => html`
  <nve-star-rating>
    <label>disabled</label>
    <input type="range" max="5" value="3" min="0" disabled />
    <nve-control-message>message</nve-control-message>
  </nve-star-rating>`
};

export const HalfStar = {
  render: () => html`
  <nve-star-rating>
    <label>Half-star rating</label>
    <input id="half-star-input" type="range" max="5" value="3.5" min="0" step="0.5" />
    <nve-control-message>message</nve-control-message>
  </nve-star-rating>
  `
};

export const Toggle = {
  render: () => html`
  <nve-star-rating>
    <label>toggle/favorite</label>
    <input type="range" max="1" value="0" min="0" />
  </nve-star-rating>
  
  <script type="module">
      const input = document.querySelector('#range');
      input.addEventListener('input', () => console.log('input', input.valueAsNumber));
      input.addEventListener('change', () => console.log('change', input.valueAsNumber));
    </script>`
};

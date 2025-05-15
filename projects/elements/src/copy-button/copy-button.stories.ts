import { html } from 'lit';
import '@nvidia-elements/core/copy-button/define.js';

export default {
  title: 'Elements/Copy Button',
  component: 'nve-copy-button',
};

export const Default = {
  render: () => html`
    <nve-copy-button value="hello" aria-label="copy value" behavior-copy></nve-copy-button>
  `
}

export const Interaction = {
  render: () => html`
    <nve-copy-button value="hello"></nve-copy-button>
    <nve-copy-button disabled value="hello"></nve-copy-button>
  `
}

export const Flat = {
  render: () => html`
    <nve-copy-button container="flat" value="hello"></nve-copy-button>
    <nve-copy-button container="flat" disabled value="hello"></nve-copy-button>
  `
}

export const BehaviorCopy = {
  render: () => html`
    <nve-copy-button value="hello" behavior-copy></nve-copy-button>
  `
}

export const Size = {
  render: () => html`
    <nve-copy-button size="sm"></nve-copy-button>
    <nve-copy-button></nve-copy-button>
    <nve-copy-button size="lg"></nve-copy-button>
  `
}

export const Hint = {
  render: () => html`
    <nve-copy-button container="flat" value="2d628479cf2db27cbdebbfe41a42f1c9e07c46a8" aria-label="2d628479cf2db27cbdebbfe41a42f1c9e07c46a8" behavior-copy>2d628479c...</nve-copy-button>
  `
}

export const Icon = {
  render: () => html`
    <nve-copy-button value="ssh://git@github.com:12051/NVIDIA/elements.git" aria-label="copy git branch" behavior-copy>
      <nve-icon name="branch" slot="icon"></nve-icon>
    </nve-copy-button>
  `
}
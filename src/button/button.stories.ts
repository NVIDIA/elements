import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { Button } from '@elements/elements/button';

import { ComponentStatuses, generateDefaultStoryParameters, InlinePosition, spread } from '@elements/elements/internal';
import { IconNames, ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/button/define.js';

const reviewDocBookmark = 'id.l12irnk25slx';
const status: ComponentStatuses = 'beta';
const description = `
  ## The MagLev Button Component
`;

export default {
  title: 'Elements/Button/Examples',
  component: 'nve-button',
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description, [
    'mouseover nve-button',
    'mouseout nve-button',
    'mousedown nve-button',
    'click nve-button'
  ]),
  argTypes: {
    interaction: {
      control: 'inline-radio',
      options: ['emphasize', 'destructive', 'ghost']
    }
  }
};

type ArgTypes = Button & {
  iconName?: IconNames;
  iconSlotPlacement: InlinePosition;
}

export const Default = {
  render: (args: ArgTypes) => html`<nve-button ${spread(args)}>${args.textContent}</nve-button>`,
  args: { textContent: 'Default', disabled: false }
};

export const Emphasize = { ...Default, args: { textContent: 'Emphasize', interaction: 'emphasize' } };
export const Ghost = { ...Default, args: { textContent: 'Ghost', interaction: 'ghost' } };
export const Destructive = { ...Default, args: { textContent: 'Destructive', interaction: 'destructive' } };
export const Disabled = { ...Default, args: { textContent: 'Disabled', disabled: true } };

export const ButtonWithIcon = {
  render: (args: ArgTypes) => html`
  <nve-button ${spread(args)}>
    ${when(args.iconSlotPlacement === 'start',() => html`<nve-icon name="${args.iconName}"></nve-icon>`)}
      ${args.textContent}
    ${when(args.iconSlotPlacement === 'end',() => html`<nve-icon name="${args.iconName}"></nve-icon>`)}
  </nve-button>`,
  args: { textContent: 'Button Icon', disabled: false, interaction: 'emphasize', iconName: 'navigate-to', iconSlotPlacement: 'end' },
  argTypes: {
    iconName: {
      control: 'select',
      options: ICON_NAMES
    },
    iconSlotPlacement: {
      control: 'inline-radio',
      options: ['start', 'end']
    },
  }
};

export const Interactions = {
  render: () => html`
    <nve-button>default</nve-button>
    <nve-button interaction="emphasize">emphasize</nve-button>
    <nve-button interaction="destructive">destructive</nve-button>
    <nve-button interaction="ghost">ghost</nve-button>
    <nve-button disabled>disabled</nve-button>
  `
}

export const Link = {
  render: () => html`
    <nve-button><a href="#">default</a></nve-button>
    <nve-button interaction="emphasize"><a href="#">emphasize</a></nve-button>
    <nve-button interaction="destructive"><a href="#">destructive</a></nve-button>
    <nve-button interaction="ghost"><a href="#">ghost</a></nve-button>
    <nve-button disabled><a href="#">disabled</a></nve-button>
  `
}

export const Themes = {
  render: () => html`
    <div nve-theme="light">
      <nve-button>default</nve-button>
      <nve-button interaction="emphasize">emphasize</nve-button>
      <nve-button interaction="destructive">destructive</nve-button>
      <nve-button interaction="ghost">ghost</nve-button>
      <nve-button disabled>disabled</nve-button>
    </div>
    <div nve-theme="dark">
      <nve-button>default</nve-button>
      <nve-button interaction="emphasize">emphasize</nve-button>
      <nve-button interaction="destructive">destructive</nve-button>
      <nve-button interaction="ghost">ghost</nve-button>
      <nve-button disabled>disabled</nve-button>
    </div>
  `
}

export const FormSubmit = {
  render: () => html`
<form id="test-form">
  <nve-button id="test-button">submit</nve-button>
</form>
<script>
  const form = document.querySelector('#test-form');
  const button = document.querySelector('#test-button');

  button.addEventListener('click', e => console.log(e));
  form.addEventListener('submit', e => {
    e.preventDefault();
    console.log(e);
  });
</script>  
`
}

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
  component: 'mlv-button',
  parameters: generateDefaultStoryParameters(status, reviewDocBookmark, description, [
    'mouseover mlv-button',
    'mouseout mlv-button',
    'mousedown mlv-button',
    'click mlv-button'
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
  render: (args: ArgTypes) => html`<mlv-button ${spread(args)}>${args.textContent}</mlv-button>`,
  args: { textContent: 'Default', disabled: false }
};

export const Emphasize = { ...Default, args: { textContent: 'Emphasize', interaction: 'emphasize' } };
export const Ghost = { ...Default, args: { textContent: 'Ghost', interaction: 'ghost' } };
export const Destructive = { ...Default, args: { textContent: 'Destructive', interaction: 'destructive' } };
export const Disabled = { ...Default, args: { textContent: 'Disabled', disabled: true } };

export const ButtonWithIcon = {
  render: (args: ArgTypes) => html`
  <mlv-button ${spread(args)}>
    ${when(args.iconSlotPlacement === 'start',() => html`<mlv-icon name="${args.iconName}"></mlv-icon>`)}
      ${args.textContent}
    ${when(args.iconSlotPlacement === 'end',() => html`<mlv-icon name="${args.iconName}"></mlv-icon>`)}
  </mlv-button>`,
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
    <mlv-button>default</mlv-button>
    <mlv-button interaction="emphasize">emphasize</mlv-button>
    <mlv-button interaction="destructive">destructive</mlv-button>
    <mlv-button interaction="ghost">ghost</mlv-button>
    <mlv-button disabled>disabled</mlv-button>
  `
}

export const Link = {
  render: () => html`
    <mlv-button><a href="#">default</a></mlv-button>
    <mlv-button interaction="emphasize"><a href="#">emphasize</a></mlv-button>
    <mlv-button interaction="destructive"><a href="#">destructive</a></mlv-button>
    <mlv-button interaction="ghost"><a href="#">ghost</a></mlv-button>
    <mlv-button disabled><a href="#">disabled</a></mlv-button>
  `
}

export const Themes = {
  render: () => html`
    <div mlv-theme="light">
      <mlv-button>default</mlv-button>
      <mlv-button interaction="emphasize">emphasize</mlv-button>
      <mlv-button interaction="destructive">destructive</mlv-button>
      <mlv-button interaction="ghost">ghost</mlv-button>
      <mlv-button disabled>disabled</mlv-button>
    </div>
    <div mlv-theme="dark">
      <mlv-button>default</mlv-button>
      <mlv-button interaction="emphasize">emphasize</mlv-button>
      <mlv-button interaction="destructive">destructive</mlv-button>
      <mlv-button interaction="ghost">ghost</mlv-button>
      <mlv-button disabled>disabled</mlv-button>
    </div>
  `
}

export const FormSubmit = {
  render: () => html`
<form id="test-form">
  <mlv-button id="test-button">submit</mlv-button>
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

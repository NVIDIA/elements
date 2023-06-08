import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { Button } from '@elements/elements/button';
import { InlinePosition, spread } from '@elements/elements/internal';
import { IconName, ICON_NAMES } from '@elements/elements/icon';
import '@elements/elements/button/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/search/define.js';

export default {
  title: 'Elements/Button/Examples',
  component: 'nve-button',
  argTypes: {
    interaction: {
      control: 'inline-radio',
      options: ['emphasize', 'destructive', 'ghost']
    }
  }
};

type ArgTypes = Button & {
  iconName: IconName;
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
    ${when(args.iconSlotPlacement === 'start',() => html`<nve-icon .name=${args.iconName}></nve-icon>`)}
      ${args.textContent}
    ${when(args.iconSlotPlacement === 'end',() => html`<nve-icon .name=${args.iconName}></nve-icon>`)}
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
    <nve-button disabled>disabled</nve-button>
  `
}

export const GhostInteractions = {
  render: () => html`
    <nve-button interaction="ghost">ghost</nve-button>
    <nve-button interaction="ghost-emphasize">ghost-emphasize</nve-button>
    <nve-button interaction="ghost-destructive">ghost-destructive</nve-button>
  `
}

export const Size = {
  render: () => html`
    <nve-button size="sm">small</nve-button>
    <nve-button>default</nve-button>
    <nve-button size="lg">large</nve-button>
  `
}

export const Link = {
  render: () => html`
<nve-button><a href="#">default</a></nve-button>
<nve-button interaction="emphasize"><a href="#">emphasize</a></nve-button>
<nve-button interaction="destructive"><a href="#">destructive</a> <nve-icon name="delete"></nve-icon></nve-button>
<nve-button disabled><a href="#">disabled</a></nve-button>
  `
}

export const PressedToggle = {
  render: () => html`
    <nve-button pressed>pressed</nve-button>
    <nve-button>unpressed</nve-button>
  `
}

export const SelectedGhost = {
  render: () => html`
    <nve-button selected interaction="ghost">selected</nve-button>
    <nve-button interaction="ghost">unselected</nve-button>
    <nve-button interaction="ghost">unselected</nve-button>
  `
}

export const LinkGhost = {
  render: () => html`
<nve-button interaction="ghost"><a href="#">ghost</a></nve-button>
<nve-button interaction="ghost-emphasize"><a href="#">ghost-emphasize</a></nve-button>
<nve-button interaction="ghost-destructive"><a href="#">ghost-destructive</a></nve-button>
  `
}

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:sm pad:md">
  <nve-button>default</nve-button>
  <nve-button interaction="emphasize">emphasize</nve-button>
  <nve-button interaction="destructive">destructive</nve-button>
  <nve-button disabled>disabled</nve-button>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:sm pad:md">
  <nve-button>default</nve-button>
  <nve-button interaction="emphasize">emphasize</nve-button>
  <nve-button interaction="destructive">destructive</nve-button>
  <nve-button disabled>disabled</nve-button>
</div>
  `
}

export const NoWrap = {
  render: () => html`
    <nve-button style="--width: 100px">item item item</nve-button>
    <nve-button style="--width: 100px">
      <span>item</span><span>item</span><span>item</span>
    </nve-button>
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

export const FormControl = {
  render: () => html`
<div nve-layout="row gap:xs" style="max-width: 400px">
  <nve-search>
    <input type="search" placeholder="search" aria-label="search" />
  </nve-search>
  <nve-button nve-control>filter option <nve-icon name="chevron-down"></nve-icon></nve-button>
</div>
  `
}

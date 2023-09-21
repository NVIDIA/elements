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
  component: 'mlv-button',
  argTypes: {
    interaction: {
      control: 'inline-radio',
      options: ['emphasize', 'destructive', 'flat']
    }
  }
};

type ArgTypes = Button & {
  iconName: IconName;
  iconSlotPlacement: InlinePosition;
}

export const Default = {
  render: (args: ArgTypes) => html`<mlv-button ${spread(args)}>${args.textContent}</mlv-button>`,
  args: { textContent: 'Default', disabled: false }
};

export const Emphasize = { ...Default, args: { textContent: 'Emphasize', interaction: 'emphasize' } };
export const Flat = { ...Default, args: { textContent: 'Flat', interaction: 'flat' } };
export const Destructive = { ...Default, args: { textContent: 'Destructive', interaction: 'destructive' } };
export const Disabled = { ...Default, args: { textContent: 'Disabled', disabled: true } };

export const ButtonWithIcon = {
  render: (args: ArgTypes) => html`
  <mlv-button ${spread(args)}>
    ${when(args.iconSlotPlacement === 'start',() => html`<mlv-icon .name=${args.iconName}></mlv-icon>`)}
      ${args.textContent}
    ${when(args.iconSlotPlacement === 'end',() => html`<mlv-icon .name=${args.iconName}></mlv-icon>`)}
  </mlv-button>`,
  args: { textContent: 'Button Icon', disabled: false, interaction: 'emphasize', iconName: 'edit', iconSlotPlacement: 'end' },
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
    <mlv-button disabled>disabled</mlv-button>
  `
}

export const FlatInteractions = {
  render: () => html`
    <mlv-button interaction="flat">flat</mlv-button>
    <mlv-button interaction="flat-emphasize">flat-emphasize</mlv-button>
    <mlv-button interaction="flat-destructive">flat-destructive</mlv-button>
  `
}

export const Size = {
  render: () => html`
    <mlv-button size="sm">small button</mlv-button>
    <mlv-button>default button</mlv-button>
    <mlv-button size="lg">large button</mlv-button>
  `
}

export const Link = {
  render: () => html`
<mlv-button><a href="#">default</a></mlv-button>
<mlv-button interaction="emphasize"><a href="#">emphasize</a></mlv-button>
<mlv-button interaction="destructive"><a href="#">destructive</a> <mlv-icon name="delete"></mlv-icon></mlv-button>
<mlv-button disabled><a href="#">disabled</a></mlv-button>
  `
}

export const PressedToggle = {
  render: () => html`
    <mlv-button pressed>pressed</mlv-button>
    <mlv-button>unpressed</mlv-button>
  `
}

export const SelectedFlat = {
  render: () => html`
    <mlv-button selected interaction="flat">selected</mlv-button>
    <mlv-button interaction="flat">unselected</mlv-button>
    <mlv-button interaction="flat">unselected</mlv-button>
  `
}

export const LinkFlat = {
  render: () => html`
<mlv-button interaction="flat"><a href="#">flat</a></mlv-button>
<mlv-button interaction="flat-emphasize"><a href="#">flat-emphasize</a></mlv-button>
<mlv-button interaction="flat-destructive"><a href="#">flat-destructive</a></mlv-button>
  `
}

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" mlv-layout="row gap:sm pad:md">
  <mlv-button>default</mlv-button>
  <mlv-button interaction="emphasize">emphasize</mlv-button>
  <mlv-button interaction="destructive">destructive</mlv-button>
  <mlv-button disabled>disabled</mlv-button>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" mlv-layout="row gap:sm pad:md">
  <mlv-button>default</mlv-button>
  <mlv-button interaction="emphasize">emphasize</mlv-button>
  <mlv-button interaction="destructive">destructive</mlv-button>
  <mlv-button disabled>disabled</mlv-button>
</div>
  `
}

export const NoWrap = {
  render: () => html`
    <mlv-button style="--width: 100px">item item item</mlv-button>
    <mlv-button style="--width: 100px">
      <span>item</span><span>item</span><span>item</span>
    </mlv-button>
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

export const FormControl = {
  render: () => html`
<div mlv-layout="row gap:xs" style="max-width: 400px">
  <mlv-search>
    <input type="search" placeholder="search" aria-label="search" />
  </mlv-search>
  <mlv-button mlv-control>filter option <mlv-icon name="caret" direction="down" size="sm"></mlv-icon></mlv-button>
</div>
  `
}

import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/search/define.js';

export default {
  title: 'Elements/Button/Examples',
  component: 'mlv-button'
};

export const Default = {
  render: () => html`<mlv-button>standard</mlv-button>`
};

export const ButtonWithIcon = {
  render: () => html`
    <mlv-button><mlv-icon name="person"></mlv-icon> button</mlv-button>
    <mlv-button>button <mlv-icon name="person"></mlv-icon></mlv-button>
  `
};

export const Interaction = {
  render: () => html`
    <mlv-button>standard</mlv-button>
    <mlv-button interaction="emphasis">emphasis</mlv-button>
    <mlv-button interaction="destructive">destructive</mlv-button>
    <mlv-button disabled>disabled</mlv-button>
  `
}

export const Flat = {
  render: () => html`
    <mlv-button container="flat">standard</mlv-button>
    <mlv-button container="flat" interaction="emphasis">emphasis</mlv-button>
    <mlv-button container="flat" interaction="destructive">destructive</mlv-button>
    <mlv-button container="flat" disabled>disabled</mlv-button>
  `
}

export const Inline = {
  render: () => html`
    <mlv-button container="inline">standard</mlv-button>
    <mlv-button container="inline" interaction="emphasis">emphasis</mlv-button>
    <mlv-button container="inline" interaction="destructive">destructive</mlv-button>
    <mlv-button container="inline" disabled>disabled</mlv-button>
  `
}

export const Deprecated = {
  render: () => html`
    <mlv-button interaction=${'emphasize' as any}>emphasize</mlv-button>
    <mlv-button interaction="flat">flat</mlv-button>
    <mlv-button interaction="flat-emphasize">flat-emphasize</mlv-button>
    <mlv-button interaction="flat-destructive">flat-destructive</mlv-button>
    <mlv-button interaction="flat" disabled>flat-disabled</mlv-button>
  `
}

export const Size = {
  render: () => html`
    <mlv-button size="sm">small button</mlv-button>
    <mlv-button>standard button</mlv-button>
    <mlv-button size="lg">large button</mlv-button>
  `
}

export const Link = {
  render: () => html`
<mlv-button><a href="#">standard</a></mlv-button>
<mlv-button interaction="emphasis"><a href="#">emphasis</a></mlv-button>
<mlv-button interaction="destructive"><a href="#">destructive</a></mlv-button>
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
    <mlv-button selected container="flat">selected</mlv-button>
    <mlv-button container="flat">unselected</mlv-button>
    <mlv-button container="flat">unselected</mlv-button>
  `
}

export const LinkFlat = {
  render: () => html`
<mlv-button container="flat"><a href="#">flat</a></mlv-button>
<mlv-button container="flat" interaction="emphasis"><a href="#">flat emphasis</a></mlv-button>
<mlv-button container="flat" interaction="destructive"><a href="#">flat destructive</a></mlv-button>
  `
}

export const LightTheme = {
  render: () => html`
<div mlv-theme="root light" nve-layout="row gap:sm pad:md">
  <mlv-button>standard</mlv-button>
  <mlv-button interaction="emphasis">emphasis</mlv-button>
  <mlv-button interaction="destructive">destructive</mlv-button>
  <mlv-button disabled>disabled</mlv-button>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div mlv-theme="root dark" nve-layout="row gap:sm pad:md">
  <mlv-button>standard</mlv-button>
  <mlv-button interaction="emphasis">emphasis</mlv-button>
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
<div nve-layout="row gap:xs" style="max-width: 400px">
  <mlv-search>
    <input type="search" placeholder="search" aria-label="search" />
  </mlv-search>
  <mlv-button mlv-control>filter option <mlv-icon name="caret" direction="down" size="sm"></mlv-icon></mlv-button>
</div>
  `
}

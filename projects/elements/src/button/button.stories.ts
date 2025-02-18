import { html } from 'lit';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/search/define.js';

export default {
  title: 'Elements/Button/Examples',
  component: 'nve-button'
};

export const Default = {
  render: () => html`<nve-button>standard</nve-button>`
};

export const ButtonWithIcon = {
  render: () => html`
    <nve-button><nve-icon name="person"></nve-icon> button</nve-button>
    <nve-button>button <nve-icon name="person"></nve-icon></nve-button>
  `
};

export const Interaction = {
  render: () => html`
    <nve-button>standard</nve-button>
    <nve-button interaction="emphasis">emphasis</nve-button>
    <nve-button interaction="destructive">destructive</nve-button>
    <nve-button disabled>disabled</nve-button>
  `
}

export const Flat = {
  render: () => html`
    <nve-button container="flat">standard</nve-button>
    <nve-button container="flat" interaction="emphasis">emphasis</nve-button>
    <nve-button container="flat" interaction="destructive">destructive</nve-button>
    <nve-button container="flat" disabled>disabled</nve-button>
  `
}

export const Inline = {
  render: () => html`
    <nve-button container="inline">standard</nve-button>
    <nve-button container="inline" interaction="emphasis">emphasis</nve-button>
    <nve-button container="inline" interaction="destructive">destructive</nve-button>
    <nve-button container="inline" disabled>disabled</nve-button>
  `
}

export const Deprecated = {
  render: () => html`
    <nve-button interaction=${'emphasize' as unknown as 'emphasis'}>emphasize</nve-button>
    <nve-button interaction="flat">flat</nve-button>
    <nve-button interaction="flat-emphasize">flat-emphasize</nve-button>
    <nve-button interaction="flat-destructive">flat-destructive</nve-button>
    <nve-button interaction="flat" disabled>flat-disabled</nve-button>
  `
}

export const Size = {
  render: () => html`
    <nve-button size="sm">small button</nve-button>
    <nve-button>standard button</nve-button>
    <nve-button size="lg">large button</nve-button>
  `
}

export const Link = {
  render: () => html`
<nve-button><a href="#">standard</a></nve-button>
<nve-button interaction="emphasis"><a href="#">emphasis</a></nve-button>
<nve-button interaction="destructive"><a href="#">destructive</a></nve-button>
<nve-button disabled><a href="#">disabled</a></nve-button>
  `
}

export const Pressed = {
  render: () => html`
    <nve-button pressed>pressed</nve-button>
    <nve-button>unpressed</nve-button>
  `
}

export const SelectedFlat = {
  render: () => html`
    <nve-button selected container="flat">selected</nve-button>
    <nve-button container="flat">unselected</nve-button>
    <nve-button container="flat">unselected</nve-button>
  `
}

export const LinkFlat = {
  render: () => html`
<nve-button container="flat"><a href="#">flat</a></nve-button>
<nve-button container="flat" interaction="emphasis"><a href="#">flat emphasis</a></nve-button>
<nve-button container="flat" interaction="destructive"><a href="#">flat destructive</a></nve-button>
  `
}

export const LightTheme = {
  render: () => html`
<div nve-theme="root light" nve-layout="row gap:sm pad:md">
  <nve-button>standard</nve-button>
  <nve-button interaction="emphasis">emphasis</nve-button>
  <nve-button interaction="destructive">destructive</nve-button>
  <nve-button disabled>disabled</nve-button>
</div>
  `
}

export const DarkTheme = {
  render: () => html`
<div nve-theme="root dark" nve-layout="row gap:sm pad:md">
  <nve-button>standard</nve-button>
  <nve-button interaction="emphasis">emphasis</nve-button>
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
  <nve-button nve-control>filter option <nve-icon name="caret" direction="down" size="sm"></nve-icon></nve-button>
</div>
  `
}

export const Popover = {
  render: () => html`
  <div popover id="popover-example">popover</div>
  <nve-button popovertarget="popover-example">toggle</nve-button>
  `
}

export const BackgroundOverride = {
  render: () => html`
    <style>
      nve-button.custom {
        --color: var(--nve-sys-text-black-color);
        --background-image: linear-gradient(340deg, rgb(255 234 177) 0%, var(--nve-ref-color-yellow-amber-900) 60%);

        &:hover {
          --background-image: linear-gradient(340deg, rgb(255 234 177) 0%, color-mix(in oklab, var(--nve-ref-color-yellow-amber-900) 100%, #000 4%) 60%);
        }
      }
    </style>

    <nve-button class="custom">Create Account</nve-button>
    <nve-button>Create Account</nve-button>
  `
};

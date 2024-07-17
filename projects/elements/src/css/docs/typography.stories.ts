import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';

export default {
  title: 'Foundations/Typography/Examples'
};

export const Type = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="display">display</p>
  <p nve-text="heading">heading</p>
  <p nve-text="body">body</p>
  <p nve-text="label">label</p>
</div>
  `
}

export const Headings = {
  render: () => html`
<div nve-layout="column gap:lg">
  <h1 nve-text="display">display</h1>
  <h2 nve-text="heading">heading</h2>
  <h3 nve-text="body">body</h3>
  <h4 nve-text="label">label</h4>
</div>
  `
}

export const Size = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="display xl">display</p>
  <p nve-text="display lg">display</p>
  <p nve-text="display">display</p>
  <p nve-text="display sm">display</p>
  <p nve-text="heading xl">heading</p>
  <p nve-text="heading lg">heading</p>
  <p nve-text="heading">heading</p>
  <p nve-text="heading sm">heading</p>
  <p nve-text="body xl">body</p>
  <p nve-text="body lg">body</p>
  <p nve-text="body">body</p>
  <p nve-text="body sm">body</p>
  <p nve-text="label xl">label</p>
  <p nve-text="label lg">label</p>
  <p nve-text="label">label</p>
  <p nve-text="label sm">label</p>
</div>
  `
}

export const Color = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="body">default</p>
  <p nve-text="body emphasis">emphasis</p>
  <p nve-text="body muted">muted</p>
</div>
  `
}

export const Weights = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="body bold">bold</p>
  <p nve-text="body semibold">semibold</p>
  <p nve-text="body medium">medium</p>
  <p nve-text="body">default</p>
  <p nve-text="body light">light</p>
</div>
  `
}

export const List = {
  render: () => html`
<ul nve-text="list">
  <li>list item 1</li>
  <li>list item 2</li>
  <li>list item 3</li>
</ul>
  `
}

export const OrderedList = {
  render: () => html`
<ol nve-text="list">
  <li>list item</li>
  <li>list item</li>
  <li>list item</li>
</ol>
  `
}

export const UnstyledList = {
  render: () => html`
<ul nve-text="list unstyled">
  <li>list item</li>
  <li>list item</li>
  <li>list item</li>
</ul>
  `
}

export const Link = {
  render: () => html`
<div nve-layout="column gap:lg">
  <a nve-text="body link" href="#">link (default)</a>
  <a nve-text="body link hover" href="#">link (hover)</a>
  <a nve-text="body link visited" href="#">link (visited)</a>
</div>
  `
}

export const Transforms = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="body uppercase">uppercase</p>
  <p nve-text="body lowercase">LOWERCASE</p>
  <p nve-text="body capitalize">capitalize</p>
  <p nve-text="body truncate" style="width: 300px;">truncate: At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi.</p>
</div>
  `
}

export const LeadingTrim = {
  render: () => html`
<div nve-layout="row gap:md">
  <nve-card>
    <nve-card-content nve-layout="column gap:lg">
      <h2 nve-text="heading">leading-trim enabled</h2>
      <h3 nve-text="body">leading-trim enabled</h3>
      <h4 nve-text="label">leading-trim enabled</h4>
    </nve-card-content>
  </nve-card>

  <nve-card>
    <nve-card-content nve-layout="column gap:lg">
      <h2 nve-text="heading trim:none">leading-trim disabled</h2>
      <h3 nve-text="body trim:none">leading-trim disabled</h3>
      <h4 nve-text="label trim:none">leading-trim disabled</h4>
    </nve-card-content>
  </nve-card>
</div>
  `
}

export const LineHeightRelative = {
  render: () => html`
  <div>
    <nve-card>
      <nve-card-content nve-layout="column">
        <p nve-text="tight">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p nve-text="loose">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </nve-card>
  </div>
  `
}

export const LineHeightFixed = {
  render: () => html`
  <div>
    <nve-card>
      <nve-card-content nve-layout="column">
      <p nve-text="line-height-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <p nve-text="line-height-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </nve-card>
  </div>
  `
}

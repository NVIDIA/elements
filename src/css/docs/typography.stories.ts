import { html } from 'lit';

export default {
  title: 'Foundation/Examples/Typography'
};

export const Type = {
  render: () => html`
<div nve-layout="column gap:lg">
  <p nve-text="display">display</p>
  <p nve-text="heading">heading</p>
  <p nve-text="body">body</p>
  <p nve-text="label">label</p>
  <p nve-text="eyebrow">eyebrow</p>
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
  <h5 nve-text="eyebrow">eyebrow</h5>
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
  <p nve-text="eyebrow xl">eyebrow</p>
  <p nve-text="eyebrow lg">eyebrow</p>
  <p nve-text="eyebrow">eyebrow</p>
  <p nve-text="eyebrow sm">eyebrow</p>
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
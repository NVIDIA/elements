import { html } from 'lit';

export default {
  title: 'Foundations/Typography/Examples'
};

export const Type = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <p mlv-text="display">display</p>
  <p mlv-text="heading">heading</p>
  <p mlv-text="body">body</p>
  <p mlv-text="label">label</p>
  <p mlv-text="eyebrow">eyebrow</p>
</div>
  `
}

export const Headings = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <h1 mlv-text="display">display</h1>
  <h2 mlv-text="heading">heading</h2>
  <h3 mlv-text="body">body</h3>
  <h4 mlv-text="label">label</h4>
  <h5 mlv-text="eyebrow">eyebrow</h5>
</div>
  `
}

export const Size = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <p mlv-text="display xl">display</p>
  <p mlv-text="display lg">display</p>
  <p mlv-text="display">display</p>
  <p mlv-text="display sm">display</p>
  <p mlv-text="heading xl">heading</p>
  <p mlv-text="heading lg">heading</p>
  <p mlv-text="heading">heading</p>
  <p mlv-text="heading sm">heading</p>
  <p mlv-text="body xl">body</p>
  <p mlv-text="body lg">body</p>
  <p mlv-text="body">body</p>
  <p mlv-text="body sm">body</p>
  <p mlv-text="label xl">label</p>
  <p mlv-text="label lg">label</p>
  <p mlv-text="label">label</p>
  <p mlv-text="label sm">label</p>
  <p mlv-text="eyebrow xl">eyebrow</p>
  <p mlv-text="eyebrow lg">eyebrow</p>
  <p mlv-text="eyebrow">eyebrow</p>
  <p mlv-text="eyebrow sm">eyebrow</p>
</div>
  `
}

export const Color = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <p mlv-text="body">default</p>
  <p mlv-text="body emphasis">emphasis</p>
  <p mlv-text="body muted">muted</p>
</div>
  `
}

export const Weights = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <p mlv-text="body bold">bold</p>
  <p mlv-text="body semibold">semibold</p>
  <p mlv-text="body medium">medium</p>
  <p mlv-text="body">default</p>
  <p mlv-text="body light">light</p>
</div>
  `
}

export const List = {
  render: () => html`
<ul mlv-text="list">
  <li>list item 1</li>
  <li>list item 2</li>
  <li>list item 3</li>
</ul>
  `
}

export const OrderedList = {
  render: () => html`
<ol mlv-text="list">
  <li>list item</li>
  <li>list item</li>
  <li>list item</li>
</ol>
  `
}

export const UnstyledList = {
  render: () => html`
<ul mlv-text="list unstyled">
  <li>list item</li>
  <li>list item</li>
  <li>list item</li>
</ul>
  `
}

export const Link = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <a mlv-text="body link" href="#">link (default)</a>
  <a mlv-text="body link hover" href="#">link (hover)</a>
  <a mlv-text="body link visited" href="#">link (visited)</a>
</div>
  `
}

export const Transforms = {
  render: () => html`
<div mlv-layout="column gap:lg">
  <p mlv-text="body uppercase">uppercase</p>
  <p mlv-text="body lowercase">LOWERCASE</p>
  <p mlv-text="body capitalize">capitalize</p>
  <p mlv-text="body truncate" style="width: 300px;">truncate: At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi.</p>
</div>
  `
}
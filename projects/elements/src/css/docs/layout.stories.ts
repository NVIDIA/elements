import { html } from 'lit';
import '@elements/elements/card/define.js';

export default {
  title: 'Foundations/Layout/Examples'
};

const layoutDemoStyles = html`
  <style>
    section {
      background-color: var(--mlv-sys-interaction-background);
      border: var(--mlv-ref-border-width-lg) solid var(--mlv-ref-border-color-emphasis);
      gap: var(--mlv-ref-space-sm);
      margin-block: var(--mlv-ref-space-sm) var(--mlv-ref-space-xl) !important;
      min-height: 200px !important;
    }

    section[mlv-layout~='column'] {
      height: 400px;
    }

    mlv-card {
      min-width: 60px !important;
      min-height: 60px !important;
      --background: var(--mlv-sys-layer-overlay-color);
    }
  </style>
`;

const generateCards = (numCards: number) => {
  const cards = [];

  for (let i = 0; i < numCards; i++) {
    cards.push(html`<mlv-card></mlv-card>`);
  }

  return html`${cards}`;
};

export const Horizontal = {
  render: () => html`
    ${layoutDemoStyles}

    <h3 mlv-text="section">Align Left</h3>
    <section mlv-layout="row align:left">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Horizontal Center</h3>
    <section mlv-layout="row align:horizontal-center">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Right</h3>
    <section mlv-layout="row align:right">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Vertical Center</h3>
    <section mlv-layout="row align:vertical-center">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Center</h3>
    <section mlv-layout="row align:center">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Vertical Center & Right</h3>
    <section mlv-layout="row align:vertical-center align:right">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Left & Bottom</h3>
    <section mlv-layout="row align:left align:bottom">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Horizontal Center & Bottom</h3>
    <section mlv-layout="row align:horizontal-center align:bottom">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Right & Bottom</h3>
    <section mlv-layout="row align:right align:bottom">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Space Around</h3>
    <section mlv-layout="row align:space-around">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Space Between</h3>
    <section mlv-layout="row align:space-between">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Space Evenly</h3>
    <section mlv-layout="row align:space-evenly">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Stretch Horizontal</h3>
    <section mlv-layout="row align:horizontal-stretch">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Stretch Vertical</h3>
    <section mlv-layout="row align:vertical-stretch">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Full Stretch</h3>
    <section mlv-layout="row align:stretch">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Wrap</h3>
    <section mlv-layout="row align:left align:top align:wrap">
      ${generateCards(10)}
    </section>

    <h3 mlv-text="section">Overflow Hidden By Default</h3>
    <section mlv-layout="row align:left align:top">
      ${generateCards(10)}
    </section>
  `
}


export const Vertical = {
  render: () => html`
    ${layoutDemoStyles}

    <h3 mlv-text="section">Align Top</h3>
    <section mlv-layout="column align:top">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Vertical Center</h3>
    <section mlv-layout="column align:vertical-center">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Bottom</h3>
    <section mlv-layout="column align:bottom">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Horizontal Center</h3>
    <section mlv-layout="column align:horizontal-center">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Center</h3>
    <section mlv-layout="column align:center">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Horizontal Center & Bottom</h3>
    <section mlv-layout="column align:horizontal-center align:bottom">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Top & Right</h3>
    <section mlv-layout="column align:top align:right">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Vertical Center & Right</h3>
    <section mlv-layout="column align:vertical-center align:right">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Bottom & Right</h3>
    <section mlv-layout="column align:bottom align:right">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Space Around</h3>
    <section mlv-layout="column align:space-around">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Space Between</h3>
    <section mlv-layout="column align:space-between">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Space Evenly</h3>
    <section mlv-layout="column align:space-evenly">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Stretch Horizontal</h3>
    <section mlv-layout="column align:horizontal-stretch">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Stretch Vertical</h3>
    <section mlv-layout="column align:vertical-stretch">
      ${generateCards(3)}
    </section>

    <h3 mlv-text="section">Align Full Stretch</h3>
    <section mlv-layout="column align:stretch">
      ${generateCards(3)}
    </section>
  `
}


export const Grid = {
  render: () => html`
    ${layoutDemoStyles}

    <h3 mlv-text="section">Grid with (<code>span-items:2</code>) specified on parent</h3>
    <section mlv-layout="grid gap:md span-items:2">
      ${generateCards(6)}
    </section>

    <h3 mlv-text="section">Grid with (<code>span-items:6</code>) specified on parent</h3>
    <section mlv-layout="grid gap:md span-items:6">
      ${generateCards(2)}
    </section>

    <h3 mlv-text="section">Grid with variable size spans</h3>
    <section mlv-layout="grid gap:md">
      <mlv-card mlv-layout="span:4"></mlv-card>
      <mlv-card mlv-layout="span:8"></mlv-card>
    </section>

    <h3 mlv-text="section">Grid with individual spans (<code>span:...</code>) on the children</h3>
    <section mlv-layout="grid gap:md">
      ${generateCards(12)}

      <mlv-card mlv-layout="span:2"></mlv-card>
      <mlv-card mlv-layout="span:2"></mlv-card>
      <mlv-card mlv-layout="span:2"></mlv-card>
      <mlv-card mlv-layout="span:2"></mlv-card>
      <mlv-card mlv-layout="span:2"></mlv-card>
      <mlv-card mlv-layout="span:2"></mlv-card>

      <mlv-card mlv-layout="span:3"></mlv-card>
      <mlv-card mlv-layout="span:3"></mlv-card>
      <mlv-card mlv-layout="span:3"></mlv-card>
      <mlv-card mlv-layout="span:3"></mlv-card>

      <mlv-card mlv-layout="span:4"></mlv-card>
      <mlv-card mlv-layout="span:4"></mlv-card>
      <mlv-card mlv-layout="span:4"></mlv-card>

      <mlv-card mlv-layout="span:5"></mlv-card>
      <mlv-card mlv-layout="span:5"></mlv-card>
      <mlv-card mlv-layout="span:2"></mlv-card>

      <mlv-card mlv-layout="span:6"></mlv-card>
      <mlv-card mlv-layout="span:6"></mlv-card>

      <mlv-card mlv-layout="span:7"></mlv-card>
      <mlv-card mlv-layout="span:3"></mlv-card>
      <mlv-card mlv-layout="span:2"></mlv-card>

      <mlv-card mlv-layout="span:8"></mlv-card>
      <mlv-card mlv-layout="span:4"></mlv-card>

      <mlv-card mlv-layout="span:9"></mlv-card>
      <mlv-card mlv-layout="span:3"></mlv-card>
    </section>


    <h3 mlv-text="section">Grid Align Top</h3>
    <section mlv-layout="grid gap:md align:top">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Vertical Center</h3>
    <section mlv-layout="grid gap:md align:vertical-center">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Bottom</h3>
    <section mlv-layout="grid gap:md align:bottom">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Horizontal Center</h3>
    <section mlv-layout="grid gap:md align:horizontal-center">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Center</h3>
    <section mlv-layout="grid gap:md align:center">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Horizontal Center & Bottom</h3>
    <section mlv-layout="grid gap:md align:horizontal-center align:bottom">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Top & Right</h3>
    <section mlv-layout="grid gap:md align:top align:right">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Vertical Center & Right</h3>
    <section mlv-layout="grid gap:md align:vertical-center align:right">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Bottom & Right</h3>
    <section mlv-layout="grid gap:md align:bottom align:right">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Stretch Horizontal</h3>
    <section mlv-layout="grid gap:md align:horizontal-stretch">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Stretch Vertical</h3>
    <section mlv-layout="grid gap:md align:vertical-stretch">
      ${generateCards(9)}
    </section>

    <h3 mlv-text="section">Grid Align Full Stretch</h3>
    <section mlv-layout="grid gap:md align:stretch">
      ${generateCards(9)}
    </section>
  `
}

export const Gaps = {
  render: () => html`
    ${layoutDemoStyles}

    <h3 mlv-text="section">Gap xxxs</h3>
    <section mlv-layout="row gap:xxxs">
      ${generateCards(5)}
    </section>

    <h3 mlv-text="section">Gap xxs</h3>
    <section mlv-layout="row gap:xxs">
      ${generateCards(5)}
    </section>

    <h3 mlv-text="section">Gap Extra Small</h3>
    <section mlv-layout="row gap:xs">
      ${generateCards(5)}
    </section>

    <h3 mlv-text="section">Gap Small</h3>
    <section mlv-layout="row gap:sm">
      ${generateCards(5)}
    </section>

    <h3 mlv-text="section">Gap Medium</h3>
    <section mlv-layout="row gap:md">
      ${generateCards(5)}
    </section>

    <h3 mlv-text="section">Gap Large</h3>
    <section mlv-layout="row gap:lg">
      ${generateCards(5)}
    </section>

    <h3 mlv-text="section">Gap Extra Large</h3>
    <section mlv-layout="row gap:xl">
      ${generateCards(5)}
    </section>

    <h3 mlv-text="section">Gap xxl</h3>
    <section mlv-layout="row gap:xxl">
      ${generateCards(5)}
    </section>

    <h3 mlv-text="section">Gap xxxl</h3>
    <section mlv-layout="row gap:xxxl">
      ${generateCards(5)}
    </section>
  `
}

export const Padding = {
  render: () => html`
    ${layoutDemoStyles}

    ${['xxxs', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'].map(size =>  html`
      <h3 mlv-text="section">Padding ${size}</h3>
      <section mlv-layout="row align:stretch pad:${size}">
        <mlv-card></mlv-card>
      </section>
    `)}

    ${['top', 'right', 'bottom', 'left'].map(side =>  html`
      <h3 mlv-text="section">Padding ${side}</h3>
      <section mlv-layout="row align:stretch pad-${side}:xxl">
        <mlv-card></mlv-card>
      </section>
    `)}
  `
}
export const Grow = {
  render: () => html`
    ${layoutDemoStyles}

      <h3 mlv-text="section">Grow Container</h3>
      <section mlv-layout="row grow"></section>
  `
}
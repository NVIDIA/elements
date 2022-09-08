import { html } from 'lit';

export default {
  title: 'Layout/Examples'
};

const layoutDemoStyles = html`
  <style>
    section {
      width: 500px;
      height: 150px;
      background-color: var(--nve-sys-layer-overlay-background);
      border: var(--nve-ref-border-width-lg) solid var(--nve-ref-border-color-emphasis);
      gap: var(--nve-ref-space-sm);
    }

    section[nve-layout~='column'] {
      height: 250px;
      width: 250px;
    }

    section[nve-layout~='grid'] {
      height: auto;
      min-height: 250px;
      max-width: 1200px;
    }

    nve-card {
      --background: var(--nve-sys-layer-overlay-color);
      --border-radius: var(--nve-ref-border-radius-sm);
    }
  </style>
`;

const generateCards = (numCards: number) => {
  const cards = [];

  for (let i = 0; i < numCards; i++) {
    cards.push(html`<nve-card></nve-card>`);
  }

  return html`${cards}`;
};

export const Horizontal = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Align Left</h3>
    <section nve-layout="row align:left">
      ${generateCards(3)}
    </section>

    <h3>Align Horizontal Center</h3>
    <section nve-layout="row align:horizontal-center">
      ${generateCards(3)}
    </section>

    <h3>Align Right</h3>
    <section nve-layout="row align:right">
      ${generateCards(3)}
    </section>

    <h3>Align Vertical Center</h3>
    <section nve-layout="row align:vertical-center">
      ${generateCards(3)}
    </section>

    <h3>Align Center</h3>
    <section nve-layout="row align:center">
      ${generateCards(3)}
    </section>

    <h3>Align Vertical Center & Right</h3>
    <section nve-layout="row align:vertical-center align:right">
      ${generateCards(3)}
    </section>

    <h3>Align Left & Bottom</h3>
    <section nve-layout="row align:left align:bottom">
      ${generateCards(3)}
    </section>

    <h3>Align Horizontal Center & Bottom</h3>
    <section nve-layout="row align:horizontal-center align:bottom">
      ${generateCards(3)}
    </section>

    <h3>Align Right & Bottom</h3>
    <section nve-layout="row align:right align:bottom">
      ${generateCards(3)}
    </section>

    <h3>Align Space Around</h3>
    <section nve-layout="row align:space-around">
      ${generateCards(3)}
    </section>

    <h3>Align Space Between</h3>
    <section nve-layout="row align:space-between">
      ${generateCards(3)}
    </section>

    <h3>Align Space Evenly</h3>
    <section nve-layout="row align:space-evenly">
      ${generateCards(3)}
    </section>

    <h3>Align Stretch Horizontal</h3>
    <section nve-layout="row align:horizontal-stretch">
      ${generateCards(3)}
    </section>

    <h3>Align Stretch Vertical</h3>
    <section nve-layout="row align:vertical-stretch">
      ${generateCards(3)}
    </section>

    <h3>Align Full Stretch</h3>
    <section nve-layout="row align:stretch">
      ${generateCards(3)}
    </section>

    <h3>Align Wrap</h3>
    <section nve-layout="row align:left align:top align:wrap">
      ${generateCards(10)}
    </section>

    <h3>Overflow Hidden By Default</h3>
    <section nve-layout="row align:left align:top">
      ${generateCards(10)}
    </section>
  `
}


export const Vertical = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Align Top</h3>
    <section nve-layout="column align:top">
      ${generateCards(3)}
    </section>

    <h3>Align Vertical Center</h3>
    <section nve-layout="column align:vertical-center">
      ${generateCards(3)}
    </section>

    <h3>Align Bottom</h3>
    <section nve-layout="column align:bottom">
      ${generateCards(3)}
    </section>

    <h3>Align Horizontal Center</h3>
    <section nve-layout="column align:horizontal-center">
      ${generateCards(3)}
    </section>

    <h3>Align Center</h3>
    <section nve-layout="column align:center">
      ${generateCards(3)}
    </section>

    <h3>Align Horizontal Center & Bottom</h3>
    <section nve-layout="column align:horizontal-center align:bottom">
      ${generateCards(3)}
    </section>

    <h3>Align Top & Right</h3>
    <section nve-layout="column align:top align:right">
      ${generateCards(3)}
    </section>

    <h3>Align Vertical Center & Right</h3>
    <section nve-layout="column align:vertical-center align:right">
      ${generateCards(3)}
    </section>

    <h3>Align Bottom & Right</h3>
    <section nve-layout="column align:bottom align:right">
      ${generateCards(3)}
    </section>

    <h3>Align Space Around</h3>
    <section nve-layout="column align:space-around">
      ${generateCards(3)}
    </section>

    <h3>Align Space Between</h3>
    <section nve-layout="column align:space-between">
      ${generateCards(3)}
    </section>

    <h3>Align Space Evenly</h3>
    <section nve-layout="column align:space-evenly">
      ${generateCards(3)}
    </section>

    <h3>Align Stretch Horizontal</h3>
    <section nve-layout="column align:horizontal-stretch">
      ${generateCards(3)}
    </section>

    <h3>Align Stretch Vertical</h3>
    <section nve-layout="column align:vertical-stretch">
      ${generateCards(3)}
    </section>

    <h3>Align Full Stretch</h3>
    <section nve-layout="column align:stretch">
      ${generateCards(3)}
    </section>
  `
}


export const Grid = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Grid with (<code>span-items:2</code>) specified on parent</h3>
    <section nve-layout="grid gap:md span-items:2">
      ${generateCards(6)}
    </section>

    <h3>Grid with (<code>span-items:6</code>) specified on parent</h3>
    <section nve-layout="grid gap:md span-items:6">
      ${generateCards(2)}
    </section>

    <h3>Grid with individual spans (<code>span:...</code>) on the children</h3>
    <section nve-layout="grid gap:md">
      ${generateCards(12)}

      <nve-card nve-layout="span:2"></nve-card>
      <nve-card nve-layout="span:2"></nve-card>
      <nve-card nve-layout="span:2"></nve-card>
      <nve-card nve-layout="span:2"></nve-card>
      <nve-card nve-layout="span:2"></nve-card>
      <nve-card nve-layout="span:2"></nve-card>

      <nve-card nve-layout="span:3"></nve-card>
      <nve-card nve-layout="span:3"></nve-card>
      <nve-card nve-layout="span:3"></nve-card>
      <nve-card nve-layout="span:3"></nve-card>

      <nve-card nve-layout="span:4"></nve-card>
      <nve-card nve-layout="span:4"></nve-card>
      <nve-card nve-layout="span:4"></nve-card>

      <nve-card nve-layout="span:5"></nve-card>
      <nve-card nve-layout="span:5"></nve-card>
      <nve-card nve-layout="span:2"></nve-card>

      <nve-card nve-layout="span:6"></nve-card>
      <nve-card nve-layout="span:6"></nve-card>

      <nve-card nve-layout="span:7"></nve-card>
      <nve-card nve-layout="span:3"></nve-card>
      <nve-card nve-layout="span:2"></nve-card>

      <nve-card nve-layout="span:8"></nve-card>
      <nve-card nve-layout="span:4"></nve-card>

      <nve-card nve-layout="span:9"></nve-card>
      <nve-card nve-layout="span:3"></nve-card>
    </section>


    <h3>Grid Align Top</h3>
    <section nve-layout="grid gap:md align:top">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Vertical Center</h3>
    <section nve-layout="grid gap:md align:vertical-center">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Bottom</h3>
    <section nve-layout="grid gap:md align:bottom">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Horizontal Center</h3>
    <section nve-layout="grid gap:md align:horizontal-center">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Center</h3>
    <section nve-layout="grid gap:md align:center">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Horizontal Center & Bottom</h3>
    <section nve-layout="grid gap:md align:horizontal-center align:bottom">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Top & Right</h3>
    <section nve-layout="grid gap:md align:top align:right">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Vertical Center & Right</h3>
    <section nve-layout="grid gap:md align:vertical-center align:right">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Bottom & Right</h3>
    <section nve-layout="grid gap:md align:bottom align:right">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Stretch Horizontal</h3>
    <section nve-layout="grid gap:md align:horizontal-stretch">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Stretch Vertical</h3>
    <section nve-layout="grid gap:md align:vertical-stretch">
      ${generateCards(9)}
    </section>

    <h3>Grid Align Full Stretch</h3>
    <section nve-layout="grid gap:md align:stretch">
      ${generateCards(9)}
    </section>
  `
}

export const Gaps = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Gap xxxs</h3>
    <section nve-layout="row gap:xxxs">
      ${generateCards(5)}
    </section>

    <h3>Gap xxs</h3>
    <section nve-layout="row gap:xxs">
      ${generateCards(5)}
    </section>

    <h3>Gap Extra Small</h3>
    <section nve-layout="row gap:xs">
      ${generateCards(5)}
    </section>

    <h3>Gap Small</h3>
    <section nve-layout="row gap:sm">
      ${generateCards(5)}
    </section>

    <h3>Gap Medium</h3>
    <section nve-layout="row gap:md">
      ${generateCards(5)}
    </section>

    <h3>Gap Large</h3>
    <section nve-layout="row gap:lg">
      ${generateCards(5)}
    </section>

    <h3>Gap Extra Large</h3>
    <section nve-layout="row gap:xl">
      ${generateCards(5)}
    </section>

    <h3>Gap xxl</h3>
    <section nve-layout="row gap:xxl">
      ${generateCards(5)}
    </section>

    <h3>Gap xxxl</h3>
    <section nve-layout="row gap:xxxl">
      ${generateCards(5)}
    </section>
  `
}
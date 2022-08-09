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

    nve-card {
      --background: var(--nve-sys-layer-overlay-color);
      --border-radius: var(--nve-ref-border-radius-sm);
    }
  </style>
`;

export const Horizontal = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Align Left</h3>
    <section nve-layout="row align:left">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Horizontal Center</h3>
    <section nve-layout="row align:horizontal-center">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Right</h3>
    <section nve-layout="row align:right">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Vertical Center</h3>
    <section nve-layout="row align:vertical-center">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Center</h3>
    <section nve-layout="row align:center">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Vertical Center & Right</h3>
    <section nve-layout="row align:vertical-center align:right">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Left & Bottom</h3>
    <section nve-layout="row align:left align:bottom">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Horizontal Center & Bottom</h3>
    <section nve-layout="row align:horizontal-center align:bottom">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Right & Bottom</h3>
    <section nve-layout="row align:right align:bottom">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Space Around</h3>
    <section nve-layout="row align:space-around">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Space Between</h3>
    <section nve-layout="row align:space-between">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Space Evenly</h3>
    <section nve-layout="row align:space-evenly">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Stretch Horizontal</h3>
    <section nve-layout="row align:horizontal-stretch">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Stretch Vertical</h3>
    <section nve-layout="row align:vertical-stretch">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Full Stretch</h3>
    <section nve-layout="row align:stretch">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Wrap</h3>
    <section nve-layout="row align:left align:top align:wrap">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Overflow Hidden By Default</h3>
    <section nve-layout="row align:left align:top">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>
  `
}


export const Vertical = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Align Top</h3>
    <section nve-layout="column align:top">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Vertical Center</h3>
    <section nve-layout="column align:vertical-center">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Bottom</h3>
    <section nve-layout="column align:bottom">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Horizontal Center</h3>
    <section nve-layout="column align:horizontal-center">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Center</h3>
    <section nve-layout="column align:center">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Horizontal Center & Bottom</h3>
    <section nve-layout="column align:horizontal-center align:bottom">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Top & Right</h3>
    <section nve-layout="column align:top align:right">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Vertical Center & Right</h3>
    <section nve-layout="column align:vertical-center align:right">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Bottom & Right</h3>
    <section nve-layout="column align:bottom align:right">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Space Around</h3>
    <section nve-layout="column align:space-around">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Space Between</h3>
    <section nve-layout="column align:space-between">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Space Evenly</h3>
    <section nve-layout="column align:space-evenly">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Stretch Horizontal</h3>
    <section nve-layout="column align:horizontal-stretch">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Stretch Vertical</h3>
    <section nve-layout="column align:vertical-stretch">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Align Full Stretch</h3>
    <section nve-layout="column align:stretch">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>
  `
}


export const Gaps = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Gap xxxs</h3>
    <section nve-layout="row gap:xxxs">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Gap xxs</h3>
    <section nve-layout="row gap:xxs">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Gap Extra Small</h3>
    <section nve-layout="row gap:xs">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Gap Small</h3>
    <section nve-layout="row gap:sm">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Gap Medium</h3>
    <section nve-layout="row gap:md">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Gap Large</h3>
    <section nve-layout="row gap:lg">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Gap Extra Large</h3>
    <section nve-layout="row gap:xl">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Gap xxl</h3>
    <section nve-layout="row gap:xxl">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>

    <h3>Gap xxxl</h3>
    <section nve-layout="row gap:xxxl">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>
  `
}
import { html } from 'lit';

export default {
  title: 'Layout/Examples'
};

const layoutDemoStyles = html`
  <style>
    section {
      width: 500px;
      height: 150px;
      background-color: var(--mlv-sys-layer-overlay-background);
      border: var(--mlv-ref-border-width-lg) solid var(--mlv-ref-border-color-emphasis);
      gap: var(--mlv-ref-space-sm);
    }


    section[mlv-layout~='column'] {
      height: 250px;
      width: 250px;
    }

    mlv-card {
      --background: var(--mlv-sys-layer-overlay-color);
      --border-radius: var(--mlv-ref-border-radius-sm);
    }
  </style>
`;

export const Horizontal = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Align Left</h3>
    <section mlv-layout="row align:left">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Horizontal Center</h3>
    <section mlv-layout="row align:horizontal-center">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Right</h3>
    <section mlv-layout="row align:right">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Vertical Center</h3>
    <section mlv-layout="row align:vertical-center">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Center</h3>
    <section mlv-layout="row align:center">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Vertical Center & Right</h3>
    <section mlv-layout="row align:vertical-center align:right">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Left & Bottom</h3>
    <section mlv-layout="row align:left align:bottom">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Horizontal Center & Bottom</h3>
    <section mlv-layout="row align:horizontal-center align:bottom">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Right & Bottom</h3>
    <section mlv-layout="row align:right align:bottom">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Space Around</h3>
    <section mlv-layout="row align:space-around">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Space Between</h3>
    <section mlv-layout="row align:space-between">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Space Evenly</h3>
    <section mlv-layout="row align:space-evenly">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Stretch Horizontal</h3>
    <section mlv-layout="row align:horizontal-stretch">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Stretch Vertical</h3>
    <section mlv-layout="row align:vertical-stretch">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Full Stretch</h3>
    <section mlv-layout="row align:stretch">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Wrap</h3>
    <section mlv-layout="row align:left align:top align:wrap">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Overflow Hidden By Default</h3>
    <section mlv-layout="row align:left align:top">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>
  `
}


export const Vertical = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Align Top</h3>
    <section mlv-layout="column align:top">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Vertical Center</h3>
    <section mlv-layout="column align:vertical-center">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Bottom</h3>
    <section mlv-layout="column align:bottom">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Horizontal Center</h3>
    <section mlv-layout="column align:horizontal-center">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Center</h3>
    <section mlv-layout="column align:center">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Horizontal Center & Bottom</h3>
    <section mlv-layout="column align:horizontal-center align:bottom">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Top & Right</h3>
    <section mlv-layout="column align:top align:right">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Vertical Center & Right</h3>
    <section mlv-layout="column align:vertical-center align:right">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Bottom & Right</h3>
    <section mlv-layout="column align:bottom align:right">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Space Around</h3>
    <section mlv-layout="column align:space-around">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Space Between</h3>
    <section mlv-layout="column align:space-between">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Space Evenly</h3>
    <section mlv-layout="column align:space-evenly">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Stretch Horizontal</h3>
    <section mlv-layout="column align:horizontal-stretch">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Stretch Vertical</h3>
    <section mlv-layout="column align:vertical-stretch">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Align Full Stretch</h3>
    <section mlv-layout="column align:stretch">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>
  `
}


export const Gaps = {
  render: () => html`
    ${layoutDemoStyles}

    <h3>Gap xxxs</h3>
    <section mlv-layout="row gap:xxxs">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Gap xxs</h3>
    <section mlv-layout="row gap:xxs">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Gap Extra Small</h3>
    <section mlv-layout="row gap:xs">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Gap Small</h3>
    <section mlv-layout="row gap:sm">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Gap Medium</h3>
    <section mlv-layout="row gap:md">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Gap Large</h3>
    <section mlv-layout="row gap:lg">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Gap Extra Large</h3>
    <section mlv-layout="row gap:xl">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Gap xxl</h3>
    <section mlv-layout="row gap:xxl">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>

    <h3>Gap xxxl</h3>
    <section mlv-layout="row gap:xxxl">
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
      <mlv-card></mlv-card>
    </section>
  `
}
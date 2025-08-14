import { html } from 'lit';

export default {
  title: 'Styles/Layout',
  component: 'layout'
};

export const HorizontalAlignLeft = {
  render: () => html`
    <section nve-layout="row gap:sm align:left">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignHorizontalCenter = {
  render: () => html`
    <section nve-layout="row gap:sm align:horizontal-center">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignRight = {
  render: () => html`
    <section nve-layout="row gap:sm align:right">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignVerticalCenter = {
  render: () => html`
    <section nve-layout="row gap:sm align:vertical-center">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignCenter = {
  render: () => html`
    <section nve-layout="row gap:sm align:center">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignVerticalCenterAndRight = {
  render: () => html`
    <section nve-layout="row gap:sm align:vertical-center align:right">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignLeftAndBottom = {
  render: () => html`
    <section nve-layout="row gap:sm align:left align:bottom">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignHorizontalCenterAndBottom = {
  render: () => html`
    <section nve-layout="row gap:sm align:horizontal-center align:bottom">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignRightAndBottom = {
  render: () => html`
    <section nve-layout="row gap:sm align:right align:bottom">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignSpaceAround = {
  render: () => html`
    <section nve-layout="row align:space-around">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignSpaceBetween = {
  render: () => html`
    <section nve-layout="row align:space-between">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignSpaceEvenly = {
  render: () => html`
    <section nve-layout="row align:space-evenly">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignStretchHorizontal = {
  render: () => html`
    <section nve-layout="row gap:sm align:horizontal-stretch">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignStretchVertical = {
  render: () => html`
    <section nve-layout="row gap:sm align:vertical-stretch">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignFullStretch = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const HorizontalAlignWrap = {
  render: () => html`
    <section nve-layout="row gap:sm align:left align:top align:wrap">
      ${new Array(20).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignTop = {
  render: () => html`
    <section nve-layout="column gap:sm align:top">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignVerticalCenter = {
  render: () => html`
    <section nve-layout="column gap:sm align:vertical-center">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignBottom = {
  render: () => html`
    <section nve-layout="column gap:sm align:bottom">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignHorizontalCenter = {
  render: () => html`
    <section nve-layout="column gap:sm align:horizontal-center">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignCenter = {
  render: () => html`
    <section nve-layout="column gap:sm align:center">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignCenterAndBottom = {
  render: () => html`
    <section nve-layout="column gap:sm align:horizontal-center align:bottom">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignTopAndRight = {
  render: () => html`
    <section nve-layout="column gap:sm align:top align:right">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignCenterAndRight = {
  render: () => html`
    <section nve-layout="column gap:sm align:vertical-center align:right">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignBottomAndRight = {
  render: () => html`
    <section nve-layout="column gap:sm align:bottom align:right">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignSpaceAround = {
  render: () => html`
    <section nve-layout="column align:space-around">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignSpaceBetween = {
  render: () => html`
    <section nve-layout="column align:space-between">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignSpaceEvenly = {
  render: () => html`
    <section nve-layout="column align:space-evenly">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignStretchHorizontal = {
  render: () => html`
    <section nve-layout="column gap:sm align:horizontal-stretch">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignStretchVertical = {
  render: () => html`
    <section nve-layout="column gap:sm align:vertical-stretch">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const VerticalAlignFullStretch = {
  render: () => html`
    <section nve-layout="column gap:sm align:stretch">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapNone = {
  render: () => html`
    <section nve-layout="row gap:none">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapXxxs = {
  render: () => html`
    <section nve-layout="row gap:xxxs">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapXxs = {
  render: () => html`
    <section nve-layout="row gap:xxs">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapXs = {
  render: () => html`
    <section nve-layout="row gap:xs">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapSm = {
  render: () => html`
    <section nve-layout="row gap:sm">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapMd = {
  render: () => html`
    <section nve-layout="row gap:md">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapLg = {
  render: () => html`
    <section nve-layout="row gap:lg">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapXl = {
  render: () => html`
    <section nve-layout="row gap:xl">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapXxl = {
  render: () => html`
    <section nve-layout="row gap:xxl">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GapXxxl = {
  render: () => html`
    <section nve-layout="row gap:xxxl">
      ${new Array(5).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadNone = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:none">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadXxxs = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:xxxs">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadXxs = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:xxs">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadXs = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:xs">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadSm = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:sm">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadMd = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:md">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadLg = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:lg">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadXl = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:xl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadXxl = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:xxl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadXxxl = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad:xxxl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadTop = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad-top:xxl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadLeft = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad-left:xxl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadRight = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad-right:xxl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadBottom = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad-bottom:xxl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadX = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad-x:xxl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const PadY = {
  render: () => html`
    <section nve-layout="row gap:sm align:stretch pad-y:xxl">
      ${new Array(3).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridSpan2 = {
  render: () => html`
    <section nve-layout="grid gap:md span-items:2">
      ${new Array(6).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridSpan6 = {
  render: () => html`
    <section nve-layout="grid gap:md span-items:6">
      ${new Array(2).fill(html`<nve-card></nve-card>`)}
    </section>
  `
};

export const GridAlignTop = {
  render: () => html`
    <section nve-layout="grid gap:md align:top align:left">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignVerticalCenter = {
  render: () => html`
    <section nve-layout="grid gap:md align:vertical-center align:left">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignBottom = {
  render: () => html`
    <section nve-layout="grid gap:md align:bottom align:left">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignHorizontalCenter = {
  render: () => html`
    <section nve-layout="grid gap:md align:horizontal-center">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignCenter = {
  render: () => html`
    <section nve-layout="grid gap:md align:center">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignCenterAndBottom = {
  render: () => html`
    <section nve-layout="grid gap:md align:horizontal-center align:bottom">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignTopAndRight = {
  render: () => html`
    <section nve-layout="grid gap:md align:top align:right">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignCenterAndRight = {
  render: () => html`
    <section nve-layout="grid gap:md align:vertical-center align:right">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignBottomAndRight = {
  render: () => html`
    <section nve-layout="grid gap:md align:bottom align:right">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignHorizontalStretch = {
  render: () => html`
    <section nve-layout="grid gap:md align:horizontal-stretch">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignVerticalStretch = {
  render: () => html`
    <section nve-layout="grid gap:md align:vertical-stretch">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridAlignFullStretch = {
  render: () => html`
    <section nve-layout="grid gap:md align:stretch">
      ${new Array(9).fill(html`<nve-card></nve-card>`)}
    </section>
  `
}

export const GridVariableSpans = {
  render: () => html`
    <section nve-layout="grid gap:md">
      ${new Array(12).fill(html`<span><nve-card></nve-card></span>`)}

      <span nve-layout="span:2"><nve-card></nve-card></span>
      <span nve-layout="span:2"><nve-card></nve-card></span>
      <span nve-layout="span:2"><nve-card></nve-card></span>
      <span nve-layout="span:2"><nve-card></nve-card></span>
      <span nve-layout="span:2"><nve-card></nve-card></span>
      <span nve-layout="span:2"><nve-card></nve-card></span>

      <span nve-layout="span:3"><nve-card></nve-card></span>
      <span nve-layout="span:3"><nve-card></nve-card></span>
      <span nve-layout="span:3"><nve-card></nve-card></span>
      <span nve-layout="span:3"><nve-card></nve-card></span>

      <span nve-layout="span:4"><nve-card></nve-card></span>
      <span nve-layout="span:4"><nve-card></nve-card></span>
      <span nve-layout="span:4"><nve-card></nve-card></span>

      <span nve-layout="span:5"><nve-card></nve-card></span>
      <span nve-layout="span:5"><nve-card></nve-card></span>
      <span nve-layout="span:2"><nve-card></nve-card></span>

      <span nve-layout="span:6"><nve-card></nve-card></span>
      <span nve-layout="span:6"><nve-card></nve-card></span>

      <span nve-layout="span:7"><nve-card></nve-card></span>
      <span nve-layout="span:3"><nve-card></nve-card></span>
      <span nve-layout="span:2"><nve-card></nve-card></span>

      <span nve-layout="span:8"><nve-card></nve-card></span>
      <span nve-layout="span:4"><nve-card></nve-card></span>

      <span nve-layout="span:9"><nve-card></nve-card></span>
      <span nve-layout="span:3"><nve-card></nve-card></span>
    </section>
  `
}

export const Full = {
  render: () => html`
    <section nve-layout="full">
      <nve-card nve-layout="full"></nve-card>
    </section>
  `
}

export const Spacing = {
  render: () => html`
<style>
  nve-card {
    min-width: 60px;
    min-height: 60px;
  }
</style>
<div nve-layout="column gap:lg align:stretch">
  <h2>Space Around</h2>
  <section nve-layout="row gap:md align:space-around">
    <div nve-layout="row gap:sm">
      <nve-search>
        <input placeholder="Search" type="search" />
      </nve-search>
    </div>
    <div nve-layout="row gap:sm">
      <nve-icon-button icon-name="filter"></nve-icon-button>
      <nve-icon-button icon-name="sort-descending"></nve-icon-button>
    </div>
  </section>

  <h2>Space Between</h2>
  <section nve-layout="row gap:md align:space-between">
    <div nve-layout="row gap:sm">
      <nve-card></nve-card>
      <nve-card></nve-card>
    </div>
    <div nve-layout="row gap:sm">
      <nve-card></nve-card>
      <nve-card></nve-card>
    </div>
  </section>

  <h2>Space Between + Full</h2>
  <section nve-layout="row gap:md align:space-between">
    <div nve-layout="row full gap:sm">
      <nve-search>
        <input placeholder="Search" type="search" />
      </nve-search>
    </div>
    <div nve-layout="row gap:sm">
      <nve-icon-button icon-name="filter"></nve-icon-button>
      <nve-icon-button icon-name="sort-descending"></nve-icon-button>
    </div>
  </section>

  <h2>Space Evenly</h2>
  <section nve-layout="row gap:md align:space-evenly">
    <div nve-layout="row gap:sm">
      <nve-card></nve-card>
      <nve-card></nve-card>
    </div>
    <div nve-layout="row gap:sm">
      <nve-card></nve-card>
      <nve-card></nve-card>
    </div>
  </section>

  <h2>Nested Rows</h2>
  <section nve-layout="row gap:md">
    <div nve-layout="row gap:sm">
      <nve-card></nve-card>
      <nve-card></nve-card>
    </div>
    <div nve-layout="row gap:sm">
      <nve-card></nve-card>
      <nve-card></nve-card>
    </div>
  </section>

  <h2>Rows</h2>
  <section nve-layout="row gap:sm">
    <nve-card></nve-card>
    <nve-card></nve-card>
  </section>
</div>
  `
}
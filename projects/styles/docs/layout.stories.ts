/* eslint-disable guard-for-in */
import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/logo/define.js';

export default {
  title: 'Foundations/Layout/Examples'
};

/* eslint-disable */
const generateLayoutStory = (name, layoutValue, numCards) => {
  return {
    render: () => html`
<section nve-layout="${layoutValue}">
${new Array(numCards).fill(html`  <nve-card></nve-card>\n`)}</section>
    `
  }
}
/* eslint-enable */


export const HorizontalAlignLeft = generateLayoutStory('Align Left', 'row gap:sm align:left', 3);
export const HorizontalAlignHorizontalCenter = generateLayoutStory('Align Horizontal Center', 'row gap:sm align:horizontal-center', 3);
export const HorizontalAlignRight = generateLayoutStory('Align Right', 'row gap:sm align:right', 3);
export const HorizontalAlignVerticalCenter = generateLayoutStory('Align Vertical Center', 'row gap:sm align:vertical-center', 3)
export const HorizontalAlignCenter = generateLayoutStory('Align Center', 'row gap:sm align:center', 3);
export const HorizontalAlignVerticalCenterAndRight = generateLayoutStory('Align Vertical Center & Right', 'row gap:sm align:vertical-center align:right', 3);
export const HorizontalAlignLeftAndBottom = generateLayoutStory('Align Left & Bottom', 'row gap:sm align:left align:bottom', 3);
export const HorizontalAlignHorizontalCenterAndBottom = generateLayoutStory('Align Horizontal Center & Bottom', 'row gap:sm align:horizontal-center align:bottom', 3);
export const HorizontalAlignRightAndBottom = generateLayoutStory('Align Right & Bottom', 'row gap:sm align:right align:bottom', 3);
export const HorizontalAlignSpaceAround = generateLayoutStory('Align Space Around', 'row align:space-around', 3);
export const HorizontalAlignSpaceBetween = generateLayoutStory('Align Space Between', 'row align:space-between', 3);
export const HorizontalAlignSpaceEvenly = generateLayoutStory('Align Space Evenly', 'row align:space-evenly', 3);
export const HorizontalAlignStretchHorizontal = generateLayoutStory('Align Stretch Horizontal', 'row gap:sm align:horizontal-stretch', 3);
export const HorizontalAlignStretchVertical = generateLayoutStory('Align Stretch Vertical', 'row gap:sm align:vertical-stretch', 3);
export const HorizontalAlignFullStretch = generateLayoutStory('Align Full Stretch', 'row gap:sm align:stretch', 3);
export const HorizontalAlignWrap = generateLayoutStory('Align Wrap', 'row gap:sm align:left align:top align:wrap', 20);


export const VerticalAlignTop = generateLayoutStory('Align Top', 'column gap:sm align:top', 3);
export const VerticalAlignVerticalCenter = generateLayoutStory('Align Vertical Center', 'column gap:sm align:vertical-center', 3);
export const VerticalAlignBottom = generateLayoutStory('Align Bottom', 'column gap:sm align:bottom', 3);
export const VerticalAlignHorizontalCenter = generateLayoutStory('Align Horizontal Center', 'column gap:sm align:horizontal-center', 3);
export const VerticalAlignCenter = generateLayoutStory('Align Center', 'column gap:sm align:center', 3);
export const VerticalAlignCenterAndBottom = generateLayoutStory('Align Center & Bottom', 'column gap:sm align:horizontal-center align:bottom', 3);
export const VerticalAlignTopAndRight = generateLayoutStory('Align Top & Right', 'column gap:sm align:top align:right', 3);
export const VerticalAlignCenterAndRight = generateLayoutStory('Align Center & Right', 'column gap:sm align:vertical-center align:right', 3);
export const VerticalAlignBottomAndRight = generateLayoutStory('Align Bottom & Right', 'column gap:sm align:bottom align:right', 3);
export const VerticalAlignSpaceAround = generateLayoutStory('Align Space Around', 'column align:space-around', 3);
export const VerticalAlignSpaceBetween = generateLayoutStory('Align Space Between', 'column align:space-between', 3);
export const VerticalAlignSpaceEvenly = generateLayoutStory('Align Space Evenly', 'column align:space-evenly', 3);
export const VerticalAlignStretchHorizontal = generateLayoutStory('Align Stretch Horizontal', 'column gap:sm align:horizontal-stretch', 3);
export const VerticalAlignStretchVertical = generateLayoutStory('Align Stretch Vertical', 'column gap:sm align:vertical-stretch', 3);
export const VerticalAlignFullStretch = generateLayoutStory('Align Full Stretch', 'column gap:sm align:stretch', 3);


export const GapNone = generateLayoutStory('Gap None', 'row gap:none', 5);
export const GapXxxs = generateLayoutStory('Gap Xxxs', 'row gap:xxxs', 5);
export const GapXxs = generateLayoutStory('Gap Xxs', 'row gap:xxs', 5);
export const GapXs = generateLayoutStory('Gap Xs', 'row gap:xs', 5);
export const GapSm = generateLayoutStory('Gap Sm', 'row gap:sm', 5);
export const GapMd = generateLayoutStory('Gap Md', 'row gap:md', 5);
export const GapLg = generateLayoutStory('Gap Lg', 'row gap:lg', 5);
export const GapXl = generateLayoutStory('Gap Xl', 'row gap:xl', 5);
export const GapXxl = generateLayoutStory('Gap Xxl', 'row gap:xxl', 5);
export const GapXxxl = generateLayoutStory('Gap Xxxl', 'row gap:xxxl', 5);


export const PadNone = generateLayoutStory('Padding None', 'row gap:sm align:stretch pad:none', 3);
export const PadXxxs = generateLayoutStory('Padding Xxxs', 'row gap:sm align:stretch pad:xxxs', 3);
export const PadXxs = generateLayoutStory('Padding Xxs', 'row gap:sm align:stretch pad:xxs', 3);
export const PadXs = generateLayoutStory('Padding Xs', 'row gap:sm align:stretch pad:xs', 3);
export const PadSm = generateLayoutStory('Padding Sm', 'row gap:sm align:stretch pad:sm', 3);
export const PadMd = generateLayoutStory('Padding Md', 'row gap:sm align:stretch pad:md', 3);
export const PadLg = generateLayoutStory('Padding Lg', 'row gap:sm align:stretch pad:lg', 3);
export const PadXl = generateLayoutStory('Padding Xl', 'row gap:sm align:stretch pad:xl', 3);
export const PadXxl = generateLayoutStory('Padding Xxl', 'row gap:sm align:stretch pad:xxl', 3);
export const PadXxxl = generateLayoutStory('Padding Xxxl', 'row gap:sm align:stretch pad:xxxl', 3);


export const PadTop = generateLayoutStory('Padding Top', 'row gap:sm align:stretch pad-top:xxl', 3);
export const PadRight = generateLayoutStory('Padding Right', 'row gap:sm align:stretch pad-right:xxl', 3);
export const PadBottom = generateLayoutStory('Padding Bottom', 'row gap:sm align:stretch pad-bottom:xxl', 3);
export const PadLeft = generateLayoutStory('Padding Left', 'row gap:sm align:stretch pad-left:xxl', 3);
export const PadX = generateLayoutStory('Padding X', 'row gap:sm align:stretch pad-x:xxl', 3);
export const PadY = generateLayoutStory('Padding Y', 'row gap:sm align:stretch pad-y:xxl', 3);


export const GridSpan2 = generateLayoutStory(html`Grid with (<code>span-items:2</code>) specified on parent`, 'grid gap:md span-items:2', 6);
export const GridSpan6 = generateLayoutStory(html`Grid with (<code>span-items:6</code>) specified on parent`, 'grid gap:md span-items:6', 2);
export const GridAlignTop = generateLayoutStory('Grid Align Top', 'grid gap:md align:top align:left', 9);
export const GridAlignVerticalCenter = generateLayoutStory('Grid Align Vertical Center', 'grid gap:md align:vertical-center align:left', 9);
export const GridAlignBottom = generateLayoutStory('Grid Align Bottom', 'grid gap:md align:bottom align:left', 9);
export const GridAlignHorizontalCenter = generateLayoutStory('Grid Align Horizontal Center', 'grid gap:md align:horizontal-center', 9);
export const GridAlignCenter = generateLayoutStory('Grid Align Center', 'grid gap:md align:center', 9);
export const GridAlignCenterAndBottom = generateLayoutStory('Grid Align Center & Bottom', 'grid gap:md align:horizontal-center align:bottom', 9);
export const GridAlignTopAndRight = generateLayoutStory('Grid Align Top & Right', 'grid gap:md align:top align:right', 9);
export const GridAlignCenterAndRight = generateLayoutStory('Grid Align Center & Right', 'grid gap:md align:vertical-center align:right', 9);
export const GridAlignBottomAndRight = generateLayoutStory('Grid Align Bottom & Right', 'grid gap:md align:bottom align:right', 9);
export const GridAlignHorizontalStretch = generateLayoutStory('Grid Align Horizontal Stretch', 'grid gap:md align:horizontal-stretch', 9);
export const GridAlignVerticalStretch = generateLayoutStory('Grid Align Vertical Stretch', 'grid gap:md align:vertical-stretch', 9);
export const GridAlignFullStretch = generateLayoutStory('Grid Align Full Stretch', 'grid gap:md align:stretch', 9);


export const GridVariableSpans = {
  render: () => html`
    <section nve-layout="grid gap:md">
      ${new Array(12).fill(html`<nve-card></nve-card>`)}

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
  `
}


export const Full = {
  render: () => html`
    <section nve-layout="row full"></section>
  `
}

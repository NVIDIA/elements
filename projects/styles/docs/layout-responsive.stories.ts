/* eslint-disable guard-for-in */
import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/logo/define.js';

export default {
  title: 'Internal/Layout/Responsive'
};

export const GapResponsive = {
  render: () => html`
    <section nve-layout="row align:center gap@sm:xs gap@md:xl gap@lg:xxl gap@xl:xxxl">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>
  `
}

export const PadResponsive = {
  render: () => html`
    <section nve-layout="row pad@sm:xxxs pad@md:md pad@lg:lg pad@xl:xxxl">
      <nve-card nve-layout="full"></nve-card>
    </section>
  `
}

export const HideResponsive = {
  render: () => html`
    <section nve-layout="row gap:lg">
      <nve-logo size="lg" color="green-mint" nve-layout="hide show@xs">1</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-layout="hide show@sm">2</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-layout="hide show@sm">3</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-layout="hide show@sm">4</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-layout="hide show@lg">5</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-layout="hide show@lg">6</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-layout="hide show@lg">7</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-layout="hide show@xl">8</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-layout="hide show@xl">9</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-layout="hide show@2xl">10</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-layout="hide@xs show@2xl">11</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-layout="hide@sm show@2xl">12</nve-logo>
    </section>
  `
}

export const FlexDirectionResponsive = {
  render: () => html`
    <section nve-layout="column row@md gap:lg">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>
  `
}

export const ResponsiveGrid = {
  render: () => html`
    <section nve-layout="grid gap:md span-items:12 span-items@sm:6 span-items@md:4 span-items@lg:3">
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

export const ResponsiveGridItems = {
  render: () => html`        
    <section nve-layout="grid gap:md">
      <nve-card nve-layout="span-items:12 span@sm:4 span@md:6 span@lg:8"></nve-card>
      <nve-card nve-layout="span-items:12 span@sm:8 span@md:6 span@lg:4"></nve-card>
      <nve-card nve-layout="span-items:12 span@sm:8 span@md:6 span@lg:4"></nve-card>
      <nve-card nve-layout="span-items:12 span@sm:4 span@md:6 span@lg:8"></nve-card>
    </section>
  `
}
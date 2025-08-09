/* eslint-disable guard-for-in */
import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';

export default {
  title: 'Internal/Layout/Responsive',
  component: 'layout responsive'
};

export const GapResponsive = {
  render: () => html`
    <section nve-layout="row align:center &sm|gap:xs &md|gap:xl &lg|gap:xxl &xl|gap:xxxl">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>
  `
}

export const PadResponsive = {
  render: () => html`
    <section nve-layout="row &sm|pad:xs &md|pad:lg &xl|pad:xxxl">
      <nve-card nve-layout="full"></nve-card>
    </section>
  `
}

export const HideResponsive = {
  render: () => html`
    <section nve-layout="row gap:lg">
      <nve-logo size="lg" color="green-mint" nve-display="hide &xs|show">1</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-display="hide &sm|show">2</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="hide &sm|show">3</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="hide &sm|show">4</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-display="hide &lg|show">5</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="hide &lg|show">6</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="hide &lg|show">7</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-display="hide &xl|show">8</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="hide &xl|show">9</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-display="hide &xxl|show">10</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&xs|hide &xxl|show">11</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&sm|hide &xxl|show">12</nve-logo>
    </section>
  `
}

export const FlexDirectionResponsive = {
  render: () => html`
    <section nve-layout="column &md|row gap:sm &md|gap:xxl">
      <nve-logo size="lg" color="green-mint">1</nve-logo>
      <nve-logo size="lg" color="green-mint">2</nve-logo>
      <nve-logo size="lg" color="green-mint">3</nve-logo>
      <nve-logo size="lg" color="green-mint">4</nve-logo>
      <nve-logo size="lg" color="green-mint">5</nve-logo>
    </section>
  `
}

export const FlexDirectionReverse = {
  render: () => html`
    <style>
      nve-logo.large {
        --width: 200px;
        --height: 200px;
      }
    </style>

    <section nve-layout="column column-reverse &lg|row gap:lg">
      <nve-logo class="large" color="green-mint">A</nve-logo>
      <nve-logo class="large" color="green-mint">B</nve-logo>
    </section>
  `
}

export const ResponsiveGrid = {
  render: () => html`
    <section nve-layout="grid gap:md span-items:12 &sm|span-items:6 &md|span-items:4 &lg|span-items:3">
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
      <nve-card nve-layout="span-items:12 &sm|span:4 &md|span:6 &lg|span:8"></nve-card>
      <nve-card nve-layout="span-items:12 &sm|span:8 &md|span:6 &lg|span:4"></nve-card>
      <nve-card nve-layout="span-items:12 &sm|span:8 &md|span:6 &lg|span:4"></nve-card>
      <nve-card nve-layout="span-items:12 &sm|span:4 &md|span:6 &lg|span:8"></nve-card>
    </section>
  `
}

// Responsive Layout - Viewport (@media query based)
export const ViewportGapResponsive = {
  render: () => html`
    <section nve-layout="row align:center @sm|gap:xs @md|gap:lg @lg|gap:xl @xl|gap:xxxl">
      <nve-card></nve-card>
      <nve-card></nve-card>
      <nve-card></nve-card>
    </section>
  `
}

export const ViewportPadResponsive = {
  render: () => html`
    <section nve-layout="row @sm|pad:xs @md|pad:lg @lg|pad:lg @xl|pad:xxxl">
      <nve-card nve-layout="full"></nve-card>
    </section>
  `
}

export const ViewportHideResponsive = {
  render: () => html`
    <section nve-layout="row gap:lg">
      <nve-logo size="lg" color="blue-cobalt">1</nve-logo>
      <nve-logo size="lg" color="blue-cobalt">2</nve-logo>
      <nve-logo size="lg" color="blue-cobalt">3</nve-logo>
      <nve-logo size="lg" color="blue-cobalt">4</nve-logo>

      <nve-logo size="lg" color="blue-cobalt" nve-display="hide @sm|show">5</nve-logo>
      <nve-logo size="lg" color="blue-cobalt" nve-display="hide @sm|show">6</nve-logo>
      <nve-logo size="lg" color="blue-cobalt" nve-display="hide @sm|show">7</nve-logo>

      <nve-logo size="lg" color="blue-cobalt" nve-display="hide @md|show">8</nve-logo>
      <nve-logo size="lg" color="blue-cobalt" nve-display="hide @md|show">9</nve-logo>
      <nve-logo size="lg" color="blue-cobalt" nve-display="hide @md|show">10</nve-logo>

      <nve-logo size="lg" color="blue-cobalt" nve-display="hide @lg|show">11</nve-logo>
      <nve-logo size="lg" color="blue-cobalt" nve-display="hide @lg|show">12</nve-logo>
    </section>
  `
}

export const ViewportFlexDirectionResponsive = {
  render: () => html`
    <section nve-layout="column @sm|row gap:sm @sm|gap:xxl">
      <nve-logo size="lg" color="blue-cobalt">1</nve-logo>
      <nve-logo size="lg" color="blue-cobalt">2</nve-logo>
      <nve-logo size="lg" color="blue-cobalt">3</nve-logo>
      <nve-logo size="lg" color="blue-cobalt">4</nve-logo>
      <nve-logo size="lg" color="blue-cobalt">5</nve-logo>
    </section>
  `
}

export const ViewportFlexDirectionReverse = {
  render: () => html`
    <style>
      nve-logo.large {
        --width: 200px;
        --height: 200px;
      }
    </style>

    <section nve-layout="column column-reverse @sm|row gap:lg">
      <nve-logo class="large" color="blue-cobalt">A</nve-logo>
      <nve-logo class="large" color="blue-cobalt">B</nve-logo>
    </section>
  `
}

export const ViewportResponsiveGrid = {
  render: () => html`
    <section nve-layout="grid gap:md span-items:12 @sm|span-items:6 @md|span-items:4 @lg|span-items:3">
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

export const ViewportResponsiveGridItems = {
  render: () => html`        
    <section nve-layout="grid gap:md">
      <nve-card nve-layout="span-items:12 @sm|span:4 @md|span:6 @lg|span:8"></nve-card>
      <nve-card nve-layout="span-items:12 @sm|span:8 @md|span:6 @lg|span:4"></nve-card>
      <nve-card nve-layout="span-items:12 @sm|span:8 @md|span:6 @lg|span:4"></nve-card>
      <nve-card nve-layout="span-items:12 @sm|span:4 @md|span:6 @lg|span:8"></nve-card>
    </section>
  `
}

export const ResponsiveCombined = {
  render: () => html`        
    <nve-page>
      <main nve-layout="column gap:lg pad:xs @lg|pad:xxl">
        <section nve-layout="grid gap:md span-items:12 @sm|span-items:6 @lg|span-items:4">
          <nve-card>
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="hide &sm|show"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>

          <nve-card>
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="hide &sm|show"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>

          <nve-card>
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="hide &sm|show"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>

          <nve-card nve-display="hide @sm|show">
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="hide &sm|show"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>

          <nve-card nve-display="hide @sm|show">
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="hide &sm|show"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>
          
          <nve-card nve-display="hide @sm|show">
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="hide &sm|show"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>
        </section>
      </main>
    </nve-page>
  `
}
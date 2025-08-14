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
      <nve-logo size="lg" color="green-mint" nve-display="&xs|hide">1</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-display="&sm|hide">2</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&sm|hide">3</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&sm|hide">4</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-display="&lg|hide">5</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&lg|hide">6</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&lg|hide">7</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-display="&xl|hide">8</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&xl|hide">9</nve-logo>

      <nve-logo size="lg" color="green-mint" nve-display="&xxl|hide">10</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&xs|hide">11</nve-logo>
      <nve-logo size="lg" color="green-mint" nve-display="&sm|hide">12</nve-logo>
    </section>
  `
}

export const FlexDirectionResponsive = {
  render: () => html`
    <section nve-layout="column gap:sm &md|row &md|gap:xxl">
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

    <section nve-layout="column gap:lg &lg|row-reverse">
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
      <span nve-layout="&sm|span:4 &md|span:6 &lg|span:8"><nve-card></nve-card></span>
      <span nve-layout="&sm|span:8 &md|span:6 &lg|span:4"><nve-card></nve-card></span>
      <span nve-layout="&sm|span:8 &md|span:6 &lg|span:4"><nve-card></nve-card></span>
      <span nve-layout="&sm|span:4 &md|span:6 &lg|span:8"><nve-card></nve-card></span>
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
      <nve-logo size="lg" color="purple-violet">1</nve-logo>
      <nve-logo size="lg" color="purple-violet">2</nve-logo>
      <nve-logo size="lg" color="purple-violet">3</nve-logo>
      <nve-logo size="lg" color="purple-violet">4</nve-logo>

      <nve-logo size="lg" color="purple-violet" nve-display="@sm|hide">5</nve-logo>
      <nve-logo size="lg" color="purple-violet" nve-display="@sm|hide">6</nve-logo>
      <nve-logo size="lg" color="purple-violet" nve-display="@sm|hide">7</nve-logo>

      <nve-logo size="lg" color="purple-violet" nve-display="@md|hide">8</nve-logo>
      <nve-logo size="lg" color="purple-violet" nve-display="@md|hide">9</nve-logo>
      <nve-logo size="lg" color="purple-violet" nve-display="@md|hide">10</nve-logo>

      <nve-logo size="lg" color="purple-violet" nve-display="@lg|hide">11</nve-logo>
      <nve-logo size="lg" color="purple-violet" nve-display="@lg|hide">12</nve-logo>
    </section>
  `
}

export const ViewportFlexDirectionResponsive = {
  render: () => html`
    <section nve-layout="column gap:sm @sm|row @sm|gap:xxl">
      <nve-logo size="lg" color="purple-violet">1</nve-logo>
      <nve-logo size="lg" color="purple-violet">2</nve-logo>
      <nve-logo size="lg" color="purple-violet">3</nve-logo>
      <nve-logo size="lg" color="purple-violet">4</nve-logo>
      <nve-logo size="lg" color="purple-violet">5</nve-logo>
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

    <section nve-layout="column gap:lg @sm|row-reverse">
      <nve-logo class="large" color="purple-violet">A</nve-logo>
      <nve-logo class="large" color="purple-violet">B</nve-logo>
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
      <span nve-layout="@sm|span:4 @md|span:6 @lg|span:8"><nve-card></nve-card></span>
      <span nve-layout="@sm|span:8 @md|span:6 @lg|span:4"><nve-card></nve-card></span>
      <span nve-layout="@sm|span:8 @md|span:6 @lg|span:4"><nve-card></nve-card></span>
      <span nve-layout="@sm|span:4 @md|span:6 @lg|span:8"><nve-card></nve-card></span>
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
              <nve-logo size="lg" nve-display="&sm|hide"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>

          <nve-card>
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="&sm|hide"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>

          <nve-card>
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="&sm|hide"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>

          <nve-card nve-display="@sm|hide">
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="&sm|hide"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>

          <nve-card nve-display="@sm|hide">
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="&sm|hide"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>
          
          <nve-card nve-display="@sm|hide">
            <nve-card-header>
              <h3 nve-text="heading lg">Responsive Card Example</h3>
            </nve-card-header>
            <nve-card-content>
              <nve-logo size="lg" nve-display="&sm|hide"></nve-logo>
              <p>This card demonstrates combining container and viewport queries.</p>
            </nve-card-content>
          </nve-card>
        </section>
      </main>
    </nve-page>
  `
}
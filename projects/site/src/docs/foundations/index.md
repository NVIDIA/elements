---
{
  title: 'Foundations',
  description: 'UI foundations for NVIDIA Elements: typography, iconography, color, themes, layout, motion, and internationalization that form the consistent visual system beneath every AI/ML, robotics, and autonomous vehicle interface.',
  layout: 'docs.11ty.js'
}
---

<style>
  a:has(nve-card) {
    text-decoration: none;

    nve-card {
      cursor: pointer;
    }
  }
</style>

# {{ title }}

Foundations are the shared visual system behind every NVIDIA Elements interface. Typography, iconography, color, themes, layout, motion, and internationalization combine into a single, consistent design language so teams and AI Agents across AI/ML infrastructure, robotics, and autonomous vehicles build tools efficiently without rebuilding the basics. Each foundation stays framework-agnostic and composes with the component library, CLI, and MCP tooling.

<section class="foundation-links" nve-layout="grid gap:md span-items:12 &md|span-items:6 &xl|span-items:4 pad-top:lg">
  <a href="/docs/foundations/typography/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="typography"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Typography</h2>
          <p nve-text="body sm muted">Type scale, weights, and text utilities for readable interfaces.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/foundations/iconography/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="shapes"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Iconography</h2>
          <p nve-text="body sm muted">Searchable icon catalog and guidance for nve-icon usage.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/foundations/themes/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="color-palette"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Themes</h2>
          <p nve-text="body sm muted">Design tokens, color, and CSS custom properties for theming.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/foundations/layout/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="view-as-grid"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Layout</h2>
          <p nve-text="body sm muted">Flexbox and grid utilities for responsive arrangements.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/foundations/popovers/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="picture-in-picture"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Popovers</h2>
          <p nve-text="body sm muted">Native popover APIs for overlays, menus, and tooltips.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/foundations/i18n/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="globe"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">i18n</h2>
          <p nve-text="body sm muted">Internationalization and localization defaults built in.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/foundations/visualization/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="chart-bar"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Visualization</h2>
          <p nve-text="body sm muted">Primitives for charts, trends, and data display.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/foundations/view-transitions/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="sparkles"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">View Transitions</h2>
          <p nve-text="body sm muted">Smooth animated transitions between page views.</p>
        </div>
      </div>
    </nve-card>
  </a>
</section>

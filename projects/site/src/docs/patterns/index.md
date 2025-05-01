---
{
  title: 'Patterns',
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

Patterns are an essential component of creating a cohesive and consistent user experience. Patterns are pre-defined combinations of existing components that can be reused across different parts of the platform to streamline development and ensure consistency in the UI. By grouping components into patterns, we can create a more organized and maintainable UI, as well as provide a unified look and feel for our users.

<section class="pattern-links" nve-layout="grid gap:md span-items:4 pad-top:lg">
  <a href="/docs/patterns/browse/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="browser"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Browse</h2>
          <p nve-text="body sm muted">Browse collections or lists of content</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/patterns/button-row/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="more-actions"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Button Row</h2>
          <p nve-text="body sm muted">Common button and action layouts</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/patterns/editor/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="carets-closed-square"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Editor</h2>
          <p nve-text="body sm muted">Code and Content Editing Patterns</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/patterns/keyboard-shortcut/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="keyboard"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Keyboard Shortcuts</h2>
          <p nve-text="body sm muted">Common keyboard shortcut patterns</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/patterns/panel/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="columns"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Panel</h2>
          <p nve-text="body sm muted">In view context details and actions</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/patterns/subheader/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:xs align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="heading"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Subheader</h2>
          <p nve-text="body sm muted">Common subheader navigation and actions</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/patterns/trend/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="trend-up"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Trend</h2>
          <p nve-text="body sm muted">Simple data trend representations</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/patterns/media/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="video-camera"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Media</h2>
          <p nve-text="body sm muted">Media content patterns and layouts</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/patterns/onboarding/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="shapes"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Onboarding</h2>
          <p nve-text="body sm muted">Guided UX steps and processes</p>
        </div>
      </div>
    </nve-card>
  </a>
</section>

---
{
  title: 'Labs',
  description: 'Experimental features in NVIDIA Elements Labs: previews of upcoming components, layout tools, and APIs.',
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

Labs projects are experimental packages the team is actively seeking feedback on. They may not be ready for production use and APIs may change frequently.

<section nve-layout="grid gap:md span-items:12 &md|span-items:6 &xl|span-items:4 pad-top:lg">
  <a href="/docs/plot/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="view-as-grid"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Plot</h2>
          <p nve-text="body sm muted">2D rendering primitives for rapid prototyping.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/scene/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="shapes"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Scene</h2>
          <p nve-text="body sm muted">3D rendering primitives for rapid prototyping.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/forms/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="rectangle-group"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Forms</h2>
          <p nve-text="body sm muted">Form control utilities and primitives.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="/docs/labs/layout/responsive/">
    <nve-card style="--border-radius: var(--nve-ref-border-radius-md)">
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg" style="--border-radius: 0">
          <nve-icon name="template"></nve-icon>
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Responsive Layout</h2>
          <p nve-text="body sm muted">HTML attributes for responsive layouts.</p>
        </div>
      </div>
    </nve-card>
  </a>
</section>

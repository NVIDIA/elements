---
{
  title: 'NVIDIA Design System for AI UI',
  description: 'NVIDIA Elements Design System: framework-agnostic Web Components, design tokens, CLI, MCP, skills, and lint tooling for AI infrastructure, robotics, and autonomous vehicle UI.',
  layout: 'docs.11ty.js'
}
---

<style>
  #docs-main #doc-content {
    max-width: 1154px;
  }

  .getting-started-page a {
    color: inherit;
    text-decoration: none;
  }

  .getting-started-page a:has(.getting-started-tile),
  .getting-started-page a:has(.getting-started-tile) nve-card,
  .getting-started-page a:has(.getting-started-tile) nve-card-content {
    cursor: pointer;
  }

  .getting-started-feature-card {
    --border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    --border-radius: var(--nve-ref-border-radius-md);
    --box-shadow: none;
  }

  .getting-started-feature-card nve-logo,
  .getting-started-tile nve-logo {
    --width: var(--nve-ref-size-900);
    --height: var(--nve-ref-size-900);
  }

  .getting-started-tile {
    --border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted);
    --border-radius: var(--nve-ref-border-radius-md);
    --box-shadow: none;
    position: relative;
    transition: box-shadow var(--nve-ref-animation-duration-150), transform var(--nve-ref-animation-duration-150);
  }

  .getting-started-tile-arrow {
    --color: var(--nve-sys-text-emphasis-color);
    --height: var(--nve-ref-size-400);
    --width: var(--nve-ref-size-400);
    opacity: 0;
    position: absolute;
    inset-block-start: var(--nve-ref-size-300);
    inset-inline-end: var(--nve-ref-size-300);
    transition: opacity var(--nve-ref-animation-duration-150);
  }

  .getting-started-page a:hover .getting-started-tile {
    --border: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-emphasis);
    --box-shadow: var(--nve-ref-shadow-100);
    transform: translateY(calc(-1 * var(--nve-ref-size-50)));
  }

  .getting-started-page a:hover .getting-started-tile-arrow,
  .getting-started-page a:focus-visible .getting-started-tile-arrow {
    opacity: 1;
  }

  .getting-started-tile nve-card-content {
    --padding: var(--nve-ref-space-lg);
    min-height: calc(var(--nve-ref-size-900) * 3);
  }

  .getting-started-tile svg {
    width: var(--nve-ref-size-900);
    height: var(--nve-ref-size-900);
    transform: scale(var(--getting-started-logo-scale, 1));
    transform-origin: center;
  }

  /* Normalize logo artwork bounds within the shared 36px canvas. */
  .getting-started-tile svg#go-svg {
    --getting-started-logo-scale: 1.65;
  }

</style>

<main class="getting-started-page" nve-layout="column gap:xl pad-top:lg">
  <section nve-layout="column gap:md">
    <h1 nve-text="display sm emphasis semibold">Getting started with NVIDIA Elements</h1>
    <p nve-text="heading sm muted">The design language and UI agent harness for AI/ML factories, robotics, and autonomous vehicles.</p>
  </section>

  <section aria-label="Elements benefits" nve-layout="grid gap:md pad-top:lg span-items:12 &md|span-items:6">
    <nve-card class="getting-started-feature-card">
      <nve-card-content nve-layout="column gap:sm">
        <nve-logo color="gray-denim"><nve-icon name="chip"></nve-icon></nve-logo>
        <div nve-layout="column gap:sm">
          <h2 nve-text="heading xs emphasis semibold">Built for AI infrastructure</h2>
          <p nve-text="body muted">Operational UI foundations for AI/ML workloads, autonomous vehicle tools, and robotics consoles.</p>
        </div>
      </nve-card-content>
    </nve-card>
    <nve-card class="getting-started-feature-card">
      <nve-card-content nve-layout="column gap:sm">
        <nve-logo color="gray-denim"><nve-icon name="add-grid"></nve-icon></nve-logo>
        <div nve-layout="column gap:sm">
          <h2 nve-text="heading xs emphasis semibold">Framework agnostic</h2>
          <p nve-text="body muted">Web Components run in React, Angular, Vue, Svelte, Lit, plain HTML, server-rendered templates, and mixed stacks.</p>
        </div>
      </nve-card-content>
    </nve-card>
    <nve-card class="getting-started-feature-card">
      <nve-card-content nve-layout="column gap:sm">
        <nve-logo color="gray-denim"><nve-icon name="sparkles"></nve-icon></nve-logo>
        <div nve-layout="column gap:sm">
          <h2 nve-text="heading xs emphasis semibold">Agent-ready tooling</h2>
          <p nve-text="body muted">CLI and MCP expose component APIs, tokens, examples, imports, validation, and setup to terminals and AI assistants.</p>
        </div>
      </nve-card-content>
    </nve-card>
    <nve-card class="getting-started-feature-card">
      <nve-card-content nve-layout="column gap:sm">
        <nve-logo color="gray-denim"><nve-icon name="check-badge"></nve-icon></nve-logo>
        <div nve-layout="column gap:sm">
          <h2 nve-text="heading xs emphasis semibold">Stable API contracts</h2>
          <p nve-text="body muted">Skills and lint guide authoring best practices, common Design System UI patterns, and automated static analysis.</p>
        </div>
      </nve-card-content>
    </nve-card>
  </section>

  <section nve-layout="column gap:xl pad-top:lg">
    <div nve-layout="column gap:md">
      <h2 nve-text="heading lg emphasis medium">1. Install the CLI</h2>
      <p nve-text="body muted">Install the CLI, scaffold a project, and configure dependencies and MCP tools in three commands.</p>
      <!-- prettier-ignore -->
      <div class="markdown-codeblock getting-started-codeblock">
        <nve-codeblock language="shell" code="# install CLI&#10;curl -fsSL {{ELEMENTS_PAGES_BASE_URL}}/install.sh | bash&#10;&#10;# create a new project&#10;nve project.create&#10;&#10;# configure dependencies and MCP tools&#10;nve project.setup"></nve-codeblock>
        <nve-copy-button class="markdown-copy-button" role="button" aria-label="Copy install commands" behavior-copy container="flat"></nve-copy-button>
      </div>
    </div>
    <div class="getting-started-import" nve-layout="column gap:md">
      <h2 nve-text="heading lg emphasis medium">2. Import into your project</h2>
      <p nve-text="body muted">Elements ships as Web Components, so it drops into any stack. Import the theme, a component definition, or use the tag directly.</p>
      <!-- prettier-ignore -->
      <div class="markdown-codeblock getting-started-codeblock">
        <nve-codeblock language="html" code="&lt;!-- CSS --&gt;&#10;&lt;style&gt;&#10;  @import '@nvidia-elements/themes/index.css';&#10;&lt;/style&gt;&#10;&#10;&lt;!-- JavaScript --&gt;&#10;&lt;script type=&quot;module&quot;&gt;&#10;  import '@nvidia-elements/core/button/define.js';&#10;&lt;/script&gt;&#10;&#10;&lt;!-- HTML --&gt;&#10;&lt;nve-button&gt;hello there&lt;/nve-button&gt;"></nve-codeblock>
        <nve-copy-button class="markdown-copy-button" role="button" aria-label="Copy import example" behavior-copy container="flat"></nve-copy-button>
      </div>
    </div>

  </section>

  <section nve-layout="column gap:lg pad-top:lg">
    <div nve-layout="column gap:sm">
      <h2 nve-text="heading lg emphasis medium">Editor and agent tools</h2>
      <p nve-text="body muted">Elements is ready for AI-assisted development, with first-class support across editors, agents, and package registries.</p>
    </div>
    <div nve-layout="grid gap:md span-items:6 &md|span-items:3">
      <a href="/docs/integrations/installation/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm"><nve-logo color="gray-denim"><nve-icon name="gear"></nve-icon></nve-logo><span nve-text="label medium">Install</span></nve-card-content></nve-card></a>
      <a href="/docs/cli/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm"><nve-logo color="gray-denim"><nve-icon name="terminal"></nve-icon></nve-logo><span nve-text="label medium">CLI</span></nve-card-content></nve-card></a>
      <a href="/docs/mcp/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm"><nve-logo color="gray-denim"><nve-icon name="plug"></nve-icon></nve-logo><span nve-text="label medium">MCP</span></nve-card-content></nve-card></a>
      <a href="/docs/mcp/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'cursor' %}<span nve-text="label medium">Cursor</span></nve-card-content></nve-card></a>
      <a href="/docs/mcp/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'codex' %}<span nve-text="label medium">Codex</span></nve-card-content></nve-card></a>
      <a href="/docs/mcp/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'claude' %}<span nve-text="label medium">Claude</span></nve-card-content></nve-card></a>
      <a href="{{ELEMENTS_REPO_BASE_URL}}" target="_blank" rel="noopener"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm"><nve-logo color="gray-denim"><nve-icon name="fork"></nve-icon></nve-logo><span nve-text="label medium">GitHub</span></nve-card-content></nve-card></a>
      <a href="https://www.npmjs.com/package/@nvidia-elements/core" target="_blank" rel="noopener"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm"><nve-logo color="gray-denim"><nve-icon name="archive"></nve-icon></nve-logo><span nve-text="label medium">npm</span></nve-card-content></nve-card></a>
      <a href="/docs/design-md/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm"><nve-logo color="gray-denim"><nve-icon name="document"></nve-icon></nve-logo><span nve-text="label medium">DESIGN.md</span></nve-card-content></nve-card></a>
    </div>
  </section>

  <section nve-layout="column gap:lg pad-top:lg">
    <div nve-layout="column gap:sm">
      <h2 nve-text="heading lg emphasis medium">Framework support</h2>
      <p nve-text="body muted">Elements is framework-agnostic. Web Components run natively across these stacks and static-site generators.</p>
    </div>
    <div nve-layout="grid gap:md span-items:6 &md|span-items:3">
      <a href="/docs/integrations/typescript/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'typescript' %}<span nve-text="label medium">TypeScript</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/installation/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'javascript' %}<span nve-text="label medium">JavaScript</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/go/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'go' %}<span nve-text="label medium">Go</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/hugo/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'hugo' %}<span nve-text="label medium">Hugo</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/lit/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'lit' %}<span nve-text="label medium">Lit</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/angular/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'angular' %}<span nve-text="label medium">Angular</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/vue/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'vue' %}<span nve-text="label medium">Vue</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/preact/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'preact' %}<span nve-text="label medium">Preact</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/nextjs/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'nextjs' %}<span nve-text="label medium">Next.js</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/react/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'react' %}<span nve-text="label medium">React</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/solidjs/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'solidjs' %}<span nve-text="label medium">SolidJS</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/svelte/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'svelte' %}<span nve-text="label medium">Svelte</span></nve-card-content></nve-card></a>
      <a href="/docs/integrations/nuxt/"><nve-card class="getting-started-tile"><nve-card-content nve-layout="column align:center justify:center gap:sm">{% svg-logo 'nuxt' %}<span nve-text="label medium">Nuxt</span></nve-card-content></nve-card></a>
    </div>
  </section>

  <script type="module">
    document.querySelectorAll('.getting-started-codeblock').forEach(codeblock => {
      const copyButton = codeblock.querySelector('nve-copy-button');
      const source = codeblock.querySelector('nve-codeblock');
      copyButton.value = source.code;
    });

    document.querySelectorAll('.getting-started-tile').forEach(tile => {
      const arrow = document.createElement('nve-icon');
      arrow.className = 'getting-started-tile-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.setAttribute('name', 'arrow-angle');
      tile.append(arrow);
    });
  </script>
</main>

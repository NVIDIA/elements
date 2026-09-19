---
{
  title: 'NVIDIA Design System for AI UI',
  description: 'NVIDIA Elements Design System: framework-agnostic Web Components, design tokens, CLI, MCP, skills, and lint tooling for AI infrastructure, robotics, and autonomous vehicle UI.',
  layout: 'docs.11ty.js',
  pageStyles: "@import './index.css';"
}
---

<div class="getting-started-page" nve-layout="column gap:xl pad-top:lg">
  <section nve-layout="column gap:md">
    <h1 nve-text="display sm emphasis semibold">NVIDIA Elements</h1>
    <h2 nve-text="heading sm muted">The design language and UI agent harness for AI/ML factories, robotics, and autonomous vehicles.</h2>
  </section>

  <section nve-layout="grid gap:md pad-top:xs span-items:12 &md|span-items:6">
    <nve-card class="getting-started-feature-card">
      <nve-card-content>
        <div nve-layout="column gap:sm">
          <nve-logo color="gray-denim"><nve-icon name="chip"></nve-icon></nve-logo>
          <div nve-layout="column gap:sm">
            <h3 nve-text="heading xs emphasis semibold">Built for AI infrastructure</h3>
            <p nve-text="body muted">Operational UI foundations for AI/ML workloads, autonomous vehicle tools, and robotics consoles.</p>
          </div>
        </div>
      </nve-card-content>
    </nve-card>
    <nve-card class="getting-started-feature-card">
      <nve-card-content>
        <div nve-layout="column gap:sm">
          <nve-logo color="gray-denim"><nve-icon name="add-grid"></nve-icon></nve-logo>
          <div nve-layout="column gap:sm">
            <h3 nve-text="heading xs emphasis semibold">Framework agnostic</h3>
            <p nve-text="body muted">Web Components run in React, Angular, Vue, Svelte, Lit, plain HTML, server-rendered templates, and mixed stacks.</p>
          </div>
        </div>
      </nve-card-content>
    </nve-card>
    <nve-card class="getting-started-feature-card">
      <nve-card-content>
        <div nve-layout="column gap:sm">
          <nve-logo color="gray-denim"><nve-icon name="sparkles"></nve-icon></nve-logo>
          <div nve-layout="column gap:sm">
            <h3 nve-text="heading xs emphasis semibold">Agent-ready tooling</h3>
            <p nve-text="body muted"><a href="/docs/cli/" nve-text="link no-visit inherit">CLI</a> and <a href="/docs/mcp/" nve-text="link no-visit inherit">MCP</a> expose component APIs, tokens, examples, imports, validation, and setup to terminals and AI assistants.</p>
          </div>
        </div>
      </nve-card-content>
    </nve-card>
    <nve-card class="getting-started-feature-card">
      <nve-card-content>
        <div nve-layout="column gap:sm">
          <nve-logo color="gray-denim"><nve-icon name="check-badge"></nve-icon></nve-logo>
          <div nve-layout="column gap:sm">
            <h3 nve-text="heading xs emphasis semibold">Stable API contracts</h3>
            <p nve-text="body muted"><a href="/docs/mcp/#skills" nve-text="link no-visit inherit">Skills</a> and <a href="/docs/lint/" nve-text="link no-visit inherit">lint</a> guide authoring best practices, common Design System UI patterns, and automated static analysis.</p>
          </div>
        </div>
      </nve-card-content>
    </nve-card>
  </section>

  <section nve-layout="column gap:lg pad-top:lg">
    <div nve-layout="column gap:sm">
      <h2 nve-text="heading lg emphasis medium">Editor and agent tools</h2>
      <p nve-text="body muted">Elements is ready for AI-assisted development, with first-class support across editors, agents, and package registries.</p>
    </div>
    <div nve-layout="grid gap:md span-items:6 &md|span-items:3 &lg|span-items:2">
      <a href="/docs/integrations/installation/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height"><nve-logo color="gray-denim"><nve-icon name="gear"></nve-icon></nve-logo><span nve-text="label medium">Install</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/cli/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height"><nve-logo color="gray-denim"><nve-icon name="terminal"></nve-icon></nve-logo><span nve-text="label medium">CLI</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/mcp/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height"><nve-logo color="gray-denim"><nve-icon name="plug"></nve-icon></nve-logo><span nve-text="label medium">MCP</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="{{ELEMENTS_REPO_BASE_URL}}" target="_blank" rel="noopener"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height"><nve-logo color="gray-denim"><nve-icon name="fork"></nve-icon></nve-logo><span nve-text="label medium">GitHub</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="https://www.npmjs.com/package/@nvidia-elements/core" target="_blank" rel="noopener"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height"><nve-logo color="gray-denim"><nve-icon name="archive"></nve-icon></nve-logo><span nve-text="label medium">npm</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/skills/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height"><nve-logo color="gray-denim"><nve-icon name="document"></nve-icon></nve-logo><span nve-text="label medium">SKILL.md</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/design-md/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height"><nve-logo color="gray-denim"><nve-icon name="document"></nve-icon></nve-logo><span nve-text="label medium">DESIGN.md</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/pi/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'pi' %}<span nve-text="label medium">Pi</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/mcp/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'cursor' %}<span nve-text="label medium">Cursor</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/mcp/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'codex' %}<span nve-text="label medium">Codex</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/mcp/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'claude' %}<span nve-text="label medium">Claude</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
    </div>
  </section>

  <section nve-layout="column gap:lg pad-top:lg">
    <div nve-layout="column gap:sm">
      <h2 nve-text="heading lg emphasis medium">Framework support</h2>
      <p nve-text="body muted">Elements is framework-agnostic. Web Components run natively across these stacks and static-site generators.</p>
    </div>
    <div nve-layout="grid gap:md span-items:6 &md|span-items:3 &lg|span-items:2">
      <a href="/docs/integrations/typescript/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'typescript' %}<span nve-text="label medium">TypeScript</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/installation/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'javascript' %}<span nve-text="label medium">JavaScript</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/go/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'go' %}<span nve-text="label medium">Golang</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/hugo/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'hugo' %}<span nve-text="label medium">Hugo</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/lit/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'lit' %}<span nve-text="label medium">Lit</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/angular/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'angular' %}<span nve-text="label medium">Angular</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/vue/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'vue' %}<span nve-text="label medium">Vue</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/preact/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'preact' %}<span nve-text="label medium">Preact</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/nextjs/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'nextjs' %}<span nve-text="label medium">Next.js</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/react/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'react' %}<span nve-text="label medium">React</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/solidjs/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'solidjs' %}<span nve-text="label medium">SolidJS</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/svelte/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'svelte' %}<span nve-text="label medium">Svelte</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
      <a href="/docs/integrations/nuxt/"><nve-card class="getting-started-tile"><nve-card-content><div nve-layout="column align:center gap:sm full:height">{% svg-logo 'nuxt' %}<span nve-text="label medium">Nuxt</span></div></nve-card-content><nve-icon name="arrow" direction="right" aria-hidden="true"></nve-icon></nve-card></a>
    </div>
  </section>

  <section nve-layout="column gap:xl pad-top:lg">
    <div nve-layout="column gap:md">
      <h2 nve-text="heading lg emphasis medium">1. Install the CLI</h2>
      <p nve-text="body muted">Install the CLI, scaffold a project, and configure dependencies and MCP tools in three commands.</p>

```shell
# install CLI
curl -fsSL {{ELEMENTS_PAGES_BASE_URL}}/install.sh | bash

# create a new project
nve project.create

# configure dependencies and MCP tools
nve project.setup
```

</div>
    <div class="getting-started-import" nve-layout="column gap:md">
      <h2 nve-text="heading lg emphasis medium">2. Import into your project</h2>
      <p nve-text="body muted">Elements ships as Web Components, so it drops into any stack. Import the theme, a component definition, or use the tag directly.</p>

```html
<!-- CSS -->
<style>
  @import '@nvidia-elements/themes/index.css';
</style>

<!-- JavaScript -->
<script type="module">
  import '@nvidia-elements/core/button/define.js';
</script>

<!-- HTML -->
<nve-button>hello there</nve-button>
```

</div>

  </section>

</div>

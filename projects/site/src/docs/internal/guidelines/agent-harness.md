---
{
  title: 'Agent Harness',
  layout: 'docs.11ty.js'
}
---

# {{title}}

## Terminology

**Prompt Engineering** - is the craft of writing instructions that steer a model toward a desired output within a single inference call. It focuses on wording, structure, and few-shot examples inside the prompt itself, independent of what tools or files surround it. A well-written prompt compensates for what the model cannot infer on its own, while a poorly written one wastes the surrounding context no matter how well curated.

**Context Engineering** - is the practice of curating what the model sees at inference time to produce better results. It spans both the project and domain layers - deciding what goes in `AGENTS.md`, which MCPs to enable, how to structure skills, and what to keep out of context to avoid noise. Good context engineering is additive and incremental. Start minimal. Add constraints when the agent fails, not preemptively.

**Harness Engineering** - (a term formalized in early 2026) is the broader discipline of designing the full agent harness system—not just prompts or context, but the structural environment the agent operates in. It treats agent failures as system design problems to solve permanently, not prompts to retry. If an agent consistently misuses an Elements component, the harness engineering answer isn't a better prompt—it's an lint rule that makes the failure impossible.

## Agent Harness Architecture

An **agent harness** is the complete system that wraps a raw LLM model and makes it useful for sustained, autonomous work. The model itself only generates text—the harness provides everything else: tools, memory, context, constraints, and feedback loops. Every lint rule, type constraint, and structural test that runs outside the model is a guarantee that doesn't depend on non-deterministic token prediction. The more the harness enforces in a deterministic way, the narrower the space where the model can produce inconsistent results and the more predictable output quality becomes.

<section nve-layout="grid span-items:6 align:vertical-center">
  <svg width="500" height="500" viewBox="-280 -280 560 560">
    <circle data-layer="domain" stroke="var(--nve-ref-color-yellow-amber-1100)" r="260" fill="none" stroke-width="2.5" style="cursor:pointer;transition:all 0.25s ease"></circle>
    <circle data-layer="project" stroke="var(--nve-ref-color-blue-cobalt-1000)" r="190" fill="none" stroke-width="1" style="cursor:pointer;transition:all 0.25s ease"></circle>
    <circle data-layer="execution" stroke="var(--nve-ref-color-purple-violet-1000)" r="125" fill="none" stroke-width="1" style="cursor:pointer;transition:all 0.25s ease"></circle>
    <circle data-layer="model" stroke="var(--nve-ref-color-green-grass-1000)" r="65" fill="none" stroke-width="1" style="cursor:pointer;transition:all 0.25s ease"></circle>
    <g data-layer="domain" style="cursor:pointer">
      <text x="0" y="-225" text-anchor="middle" fill="var(--nve-ref-color-yellow-amber-1100)" font-size="13" font-weight="700">Domain Harness</text>
      <text x="0" y="-207" text-anchor="middle" fill="var(--nve-ref-color-yellow-amber-1100)" font-size="9" style="pointer-events:none">Business Intent &amp; Organization Knowledge</text>
    </g>
    <g data-layer="project" style="cursor:pointer">
      <text x="0" y="-158" text-anchor="middle" fill="var(--nve-ref-color-blue-cobalt-1000)" font-size="11" font-weight="600">Project Harness</text>
      <text x="0" y="-142" text-anchor="middle" fill="var(--nve-ref-color-blue-cobalt-1000)" font-size="9">Code-Space Constraints</text>
    </g>
    <g data-layer="execution" style="cursor:pointer">
      <text x="0" y="-93" text-anchor="middle" fill="var(--nve-ref-color-purple-violet-1000)" font-size="11" font-weight="600">Execution Harness</text>
      <text x="0" y="-77" text-anchor="middle" fill="var(--nve-ref-color-purple-violet-1000)" font-size="9">The Agent Loop</text>
    </g>
    <g data-layer="model" style="cursor:pointer">
      <text x="0" y="-5" text-anchor="middle" fill="currentColor" font-size="11" font-weight="700">LLM Model</text>
      <text x="0" y="10" text-anchor="middle" fill="currentColor" font-size="8">Raw Intelligence</text>
    </g>
    <circle data-hit="domain" r="225" fill="none" stroke="transparent" stroke-width="70" style="cursor:pointer;pointer-events:stroke"></circle>
    <circle data-hit="project" r="157.5" fill="none" stroke="transparent" stroke-width="65"  style="cursor:pointer;pointer-events:stroke"></circle>
    <circle data-hit="execution" r="95" fill="none" stroke="transparent" stroke-width="60" style="cursor:pointer;pointer-events:stroke"></circle>>
    <circle data-hit="model" r="65" fill="transparent" style="cursor:pointer;pointer-events:fill"></circle>
  </svg>
  <section id="detail-card" nve-layout="column gap:lg">
    <div nve-layout="column gap:sm">
      <h3 id="detail-title" nve-text="heading xl semibold"></h3>
      <p id="detail-subtitle" nve-text="label lg muted"></p>
    </div>
    <div nve-layout="column gap:lg">
      <p id="detail-desc" nve-text="body"></p>
      <ul id="detail-items" nve-text="list" nve-layout="column gap:sm pad:md"></ul>
      <span id="detail-rule-text" nve-text="body muted"></span>
    </div>
  </section>
</section>

## Where Elements Fits

Elements lives entirely in the <strong style="color: var(--nve-ref-color-blue-cobalt-1000)">Project Harness</strong> as horizontal infrastructure that serves many domains - AV, Infra, Robotics, Research - without coupling to any of them. Each domain team layers their own domain specific harness on top. The CLI and MCP expose the same API - one for humans, one for agents.

<div nve-layout="grid gap:xl span-items:4 align:vertical-stretch">
  <div nve-layout="column gap:sm">
    <p nve-text="label sm semibold">ESLint plugin</p>
    <p nve-text="body xs muted">Enforces correct API usage at the source level</p>
  </div>
  <div nve-layout="column gap:sm">
    <p nve-text="label sm semibold">TypeScript types</p>
    <p nve-text="body xs muted">Surfaces API errors at compile time</p>
  </div>
  <div nve-layout="column gap:sm">
    <p nve-text="label sm semibold">Elements CLI</p>
    <p nve-text="body xs muted">Terminal access to the design system API</p>
  </div>
  <div nve-layout="column gap:sm">
    <p nve-text="label sm semibold">Elements MCP</p>
    <p nve-text="body xs muted">Agent access to the same CLI API -- 1:1 mirror</p>
  </div>
  <div nve-layout="column gap:sm">
    <p nve-text="label sm semibold">Agent Skills</p>
    <p nve-text="body xs muted">System level understanding and guidance</p>
  </div>
  <div nve-layout="column gap:sm">
    <p nve-text="label sm semibold">Strict Component APIs</p>
    <p nve-text="body xs muted">Long term stable platform focused APIs</p>
  </div>
</div>

## Where should you invest?

Not every layer of your teams agent harness deserves equal effort. The model and execution layers are commodities you select, not build. Your leverage comes from the project and domain layers where you encode what makes your codebase and organization unique.

{% dodont %}

<div>

- **Focus on project harness.** Lint rules, strict static typing, and testing infrastructure, give the agent guardrails that prevent mistakes regardless of domain.
- **Grow the domain harness over time.** Domain context (AGENTS markdown, organization MCPs/Skills) orients the agent toward the right goals.

</div>
<div>

- **Don't custom-train models.** Foundation models improve faster than any fine-tune can keep up. Treat the model layer as interchangeable.
- **Don't build execution harnesses.** Claude Code, Cursor, and Codex already handle the agent loop, tool dispatch, and context management.

</div>
{% enddodont %}

## Domain-Driven Design

The agent harness onion appears to invert DDD, the domain sits at the outside, not the center. This is not a contradiction. They measure different things along different axes.

- **DDD axis: dependency direction.** Domain at the center means nothing depends on the domain model - infrastructure adapts to it, never the reverse. The domain is the stable core.
- **Agent harness axis: context flow.** Domain at the outside means business intent wraps and informs everything inward at runtime. An agent without domain context builds technically correct code for the wrong purpose.

Ubiquitous language encoded in types and names give an agent far more structure to navigate and respect than a loosely organized codebase. DDD and harness engineering are mutually reinforcing disciplines.

<script type="module">
const layers = [
  {
    id: 'domain', label: 'Domain Harness', sublabel: 'Business Intent & Organization Knowledge',
    color: 'var(--nve-ref-color-yellow-amber-1100)',
    description: 'Orients the agent toward business intent. Carries organizational context -- why things are built, for whom, and under what constraints.',
    items: [
      { text: 'CLAUDE.md / AGENTS.md' },
      { text: 'Slack, Issue Tracking, MCPs' },
      { text: 'Cloud drives, internal docs' },
      { text: 'Business domain context files' },
      { text: 'Org conventions & standards' },
      { text: 'Domain / behavior tests - Is this code doing the right thing?' },
    ],
    rule: "If it asks 'is this code doing the right thing?' -- Domain Harness",
  },
  {
    id: 'project', label: 'Project Harness', sublabel: 'Code-Space Constraints',
    color: 'var(--nve-ref-color-blue-cobalt-1000)',
    description: 'Enforces structural correctness on the codebase. Scoped to the repo -- applies to any project regardless of business domain.',
    items: [
      { text: 'Lint & Static Typing' },
      { text: 'Architecture / structural tests' },
      { text: 'Build Caching' },
      { text: 'Playwright / E2E' },
      { text: 'Conventional Commits' },
      { text: 'Cyclomatic Complexity' },
    ],
    rule: "If it asks 'is this code structured correctly?' -- Project Harness",
  },
  {
    id: 'execution', label: 'Execution Harness', sublabel: 'The Agent Loop',
    color: 'var(--nve-ref-color-purple-violet-1000)',
    description: 'Wraps the LLM with tool dispatch, memory management, and session lifecycle. You choose one -- you do not build it.',
    items: [
      { text: 'Claude Code, Cursor, Codex' },
      { text: 'Managing the think → act → observe loop' },
      { text: 'Dispatching tool calls (file I/O, bash, search)' },
      { text: 'Memory management' },
      { text: 'Sub-agent coordination' },
      { text: 'Permissions & human-in-loop' },
    ],
    rule: 'The loop runner -- manages execution, tools, memory',
  },
  {
    id: 'model', label: 'LLM Model', sublabel: 'Raw Intelligence',
    color: 'var(--nve-ref-color-green-grass-1000)',
    description: 'The raw model at the core. Generates text. Knows nothing about your codebase, org, or project without the layers around it.',
    items: [
      { text: 'Nemotron' },
      { text: 'Claude Opus / Sonnet' },
      { text: 'GPT-5' },
      { text: 'Token-based reasoning' },
      { text: 'Frozen weights' },
      { text: 'Pluggable / swappable' },
    ],
    rule: 'Same model, radically different behavior -- the harness is the difference',
  },
];

const circleMap = { domain: 0, project: 1, execution: 2, model: 3 };
const circles = document.querySelectorAll('circle[data-layer]');
const labelGroups = document.querySelectorAll('g[data-layer]');
const tabs = document.getElementById('layer-tabs');
const detailTitle = document.getElementById('detail-title');
const detailSubtitle = document.getElementById('detail-subtitle');
const detailDesc = document.getElementById('detail-desc');
const detailItems = document.getElementById('detail-items');
const detailRuleText = document.getElementById('detail-rule-text');

let locked = false;

setActive('model');
function setActive(layerId) {
  const layer = layers.find(l => l.id === layerId);
  if (!layer) return;

  // Update SVG circles
  circles.forEach(c => {
    const id = c.getAttribute('data-layer');
    const l = layers.find(x => x.id === id);
    const isActive = id === layerId;

    c.setAttribute('stroke-width', isActive ? '2.5' : '1');
    c.setAttribute('stroke-opacity', isActive ? '1' : '0.3');
    c.setAttribute('filter', isActive ? 'url(#softglow)' : 'none');
  });

  // Update SVG labels
  labelGroups.forEach(g => {
    const id = g.getAttribute('data-layer');
    const l = layers.find(x => x.id === id);
    const isActive = id === layerId;
    const texts = g.querySelectorAll('text');
    texts[0].setAttribute('fill', isActive ? l.color : 'currentColor');
    texts[1].setAttribute('fill', isActive ? l.color : 'currentColor');
  });

  // Update detail card
  detailTitle.style.setProperty('color', layer.color, 'important');
  detailTitle.textContent = layer.label;
  detailSubtitle.textContent = layer.sublabel;
  detailDesc.textContent = layer.description;
  detailRuleText.textContent = layer.rule;

  // Update items
  detailItems.innerHTML = '';
  layer.items.forEach(item => {
    const text = document.createElement('li');
    text.setAttribute('nve-text', 'body sm');
    text.textContent = item.text;
    detailItems.appendChild(text);
  });
}

// SVG ring hit-target clicks and hovers
const hitTargets = document.querySelectorAll('circle[data-hit]');
hitTargets.forEach(h => {
  h.addEventListener('click', () => { locked = true; setActive(h.getAttribute('data-hit')); });
  h.addEventListener('mouseenter', () => { if (!locked) setActive(h.getAttribute('data-hit')); });
});

// SVG label clicks and hovers
labelGroups.forEach(g => {
  g.addEventListener('click', () => { locked = true; setActive(g.getAttribute('data-layer')); });
  g.addEventListener('mouseenter', () => { if (!locked) setActive(g.getAttribute('data-layer')); });
});

// Unlock hover when mouse leaves the SVG
document.querySelector('svg').addEventListener('mouseleave', () => { locked = false; });
</script>

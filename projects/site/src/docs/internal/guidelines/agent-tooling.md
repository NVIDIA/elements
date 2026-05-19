---
{
  title: 'Agent Tooling',
  description: 'Internal guidelines: best practices for designing metadata, static checks, CLI tools, skills, apps, and MCP servers for agents.',
  layout: 'docs.11ty.js'
}
---

# {{title}}

Agent tooling is not a separate product surface. It adds progressively higher-level adapters over the same metadata, validation rules, and package APIs that humans use. Build the slow deterministic layer first. Add model-facing tools only after the lower layer can answer the question or reject the invalid state.

## Policy Compiler

Turn repeated guidance into facts, gates, commands, and agent tools.

<section id="tooling-policy-compiler" nve-layout="column gap:sm">
  <svg width="100%" height="250" viewBox="0 100 1120 250">
    <defs>
      <marker id="tooling-arrow-metadata" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fill-opacity="0.45"></path>
      </marker>
      <marker id="tooling-arrow-static-tools" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fill-opacity="0.45"></path>
      </marker>
      <marker id="tooling-arrow-cli-skills" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fill-opacity="0.45"></path>
      </marker>
      <marker id="tooling-arrow-mcp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fill-opacity="0.45"></path>
      </marker>
    </defs>
    <text x="8" y="124" fill="currentColor" fill-opacity="0.55" font-size="11">most effort / durable</text>
    <text x="1112" y="124" text-anchor="end" fill="currentColor" fill-opacity="0.55" font-size="11">fast / contextual</text>
    <line x1="8" y1="132" x2="1112" y2="132" stroke="currentColor" stroke-opacity="0.18" stroke-width="1"></line>
    <path data-tooling-connection data-tooling-from="metadata" data-tooling-to="static-tools" d="M 352 202 L 372 202" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5" marker-end="url(#tooling-arrow-static-tools)"></path>
    <path data-tooling-connection data-tooling-from="static-tools" data-tooling-to="cli-skills" d="M 660 202 L 680 202" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5" marker-end="url(#tooling-arrow-cli-skills)"></path>
    <path data-tooling-connection data-tooling-from="cli-skills" data-tooling-to="mcp" d="M 920 202 L 940 202" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5" marker-end="url(#tooling-arrow-mcp)"></path>
    <g data-tooling-layer="metadata" style="cursor:pointer">
      <rect x="8" y="154" width="344" height="96" rx="8" fill="var(--nve-ref-color-green-grass-1000)" fill-opacity="0.08" stroke="var(--nve-ref-color-green-grass-1000)" stroke-width="1"></rect>
      <text x="180" y="194" text-anchor="middle" fill="var(--nve-ref-color-green-grass-1000)" font-size="17" font-weight="700">Metadata</text>
      <text x="180" y="220" text-anchor="middle" fill="var(--nve-ref-color-green-grass-1000)" font-size="11">Source Of Truth</text>
    </g>
    <g data-tooling-layer="static-tools" style="cursor:pointer">
      <rect x="372" y="154" width="288" height="96" rx="8" fill="var(--nve-ref-color-yellow-amber-1100)" fill-opacity="0.08" stroke="var(--nve-ref-color-yellow-amber-1100)" stroke-width="1"></rect>
      <text x="516" y="194" text-anchor="middle" fill="var(--nve-ref-color-yellow-amber-1100)" font-size="16" font-weight="700">Static Tools</text>
      <text x="516" y="218" text-anchor="middle" fill="var(--nve-ref-color-yellow-amber-1100)" font-size="11">Lint, Types, Tests</text>
    </g>
    <g data-tooling-layer="cli-skills" style="cursor:pointer">
      <rect x="680" y="154" width="240" height="96" rx="8" fill="var(--nve-ref-color-blue-cobalt-1000)" fill-opacity="0.08" stroke="var(--nve-ref-color-blue-cobalt-1000)" stroke-width="1"></rect>
      <text x="800" y="194" text-anchor="middle" fill="var(--nve-ref-color-blue-cobalt-1000)" font-size="15" font-weight="700">CLI / Skills</text>
      <text x="800" y="216" text-anchor="middle" fill="var(--nve-ref-color-blue-cobalt-1000)" font-size="10">Commands, Context</text>
    </g>
    <g data-tooling-layer="mcp" style="cursor:pointer">
      <rect x="940" y="154" width="172" height="96" rx="8" fill="var(--nve-ref-color-purple-violet-1000)" fill-opacity="0.08" stroke="var(--nve-ref-color-purple-violet-1000)" stroke-width="1"></rect>
      <text x="1026" y="195" text-anchor="middle" fill="var(--nve-ref-color-purple-violet-1000)" font-size="14" font-weight="700">MCP / Apps</text>
      <text x="1026" y="214" text-anchor="middle" fill="var(--nve-ref-color-purple-violet-1000)" font-size="9">Agent Interfaces</text>
    </g>
    <line x1="180" y1="306" x2="1026" y2="306" stroke="currentColor" stroke-opacity="0.2" stroke-width="2"></line>
    <circle data-tooling-step="metadata" cx="180" cy="306" r="6" fill="var(--nve-ref-color-green-grass-1000)"></circle>
    <circle data-tooling-step="static-tools" cx="516" cy="306" r="6" fill="var(--nve-ref-color-yellow-amber-1100)"></circle>
    <circle data-tooling-step="cli-skills" cx="800" cy="306" r="6" fill="var(--nve-ref-color-blue-cobalt-1000)"></circle>
    <circle data-tooling-step="mcp" cx="1026" cy="306" r="6" fill="var(--nve-ref-color-purple-violet-1000)"></circle>
    <text x="180" y="334" text-anchor="middle" fill="currentColor" fill-opacity="0.62" font-size="10">facts</text>
    <text x="516" y="334" text-anchor="middle" fill="currentColor" fill-opacity="0.62" font-size="10">gates</text>
    <text x="800" y="334" text-anchor="middle" fill="currentColor" fill-opacity="0.62" font-size="10">paths</text>
    <text x="1026" y="334" text-anchor="middle" fill="currentColor" fill-opacity="0.62" font-size="10">tools</text>
  </svg>
  <section id="tooling-detail-card" nve-layout="column gap:lg">
    <div nve-layout="column gap:sm">
      <h3 id="tooling-detail-title" nve-text="heading xl semibold"></h3>
      <p id="tooling-detail-subtitle" nve-text="label lg muted"></p>
    </div>
    <div nve-layout="column gap:lg">
      <p id="tooling-detail-desc" nve-text="body"></p>
      <ul id="tooling-detail-items" nve-text="list" nve-layout="column gap:sm pad:md"></ul>
      <span id="tooling-detail-rule-text" nve-text="body muted"></span>
    </div>
  </section>
</section>

<script type="module">
const toolingRoot = document.getElementById('tooling-policy-compiler');
const toolingLayers = [
  {
    id: 'metadata',
    label: 'Metadata',
    sublabel: 'Source Of Truth',
    color: 'var(--nve-ref-color-green-grass-1000)',
    description: 'Turns the rule into durable facts that every higher layer can query. Tools should read metadata, not repeat facts in prompts.',
    items: [
      { text: 'Generated API manifests' },
      { text: 'Reference metadata' },
      { text: 'Entrypoints and package data' },
      { text: 'One fact feeding many surfaces' },
    ],
    rule: 'If the fact describes the system, encode it once as structured data.',
  },
  {
    id: 'static-tools',
    label: 'Static Tools',
    sublabel: 'Deterministic Rejection',
    color: 'var(--nve-ref-color-yellow-amber-1100)',
    description: 'Compiles facts into rules that fail before runtime. This layer should catch every invalid state a parser can see.',
    items: [
      { text: 'Type checking and JSON schema' },
      { text: 'Lint and static analysis' },
      { text: 'Unit and integration tests' },
      { text: 'CI and build checks' },
    ],
    rule: 'If a parser can catch it, fail before runtime.',
  },
  {
    id: 'cli-skills',
    label: 'CLI and Skills',
    sublabel: 'Commands and Workflow Context',
    color: 'var(--nve-ref-color-blue-cobalt-1000)',
    description: 'Adapts deterministic behavior into repeatable terminal commands and focused workflow context. Humans prove the path first.',
    items: [
      { text: 'Discovery and validation commands' },
      { text: 'Project setup and scaffolding' },
      { text: 'Prototype creation and validation' },
      { text: 'Workflow order and local policy' },
    ],
    rule: 'Expose deterministic behavior in the CLI. Put sequencing judgment in skills.',
  },
  {
    id: 'mcp',
    label: 'MCP and Apps',
    sublabel: 'Agent Interfaces',
    color: 'var(--nve-ref-color-purple-violet-1000)',
    description: 'Exposes stable services to agents through narrow schemas, structured outputs, and explicit side-effect annotations.',
    items: [
      { text: 'Tool schemas derived from services and CLIs' },
      { text: 'Prompts for common workflows' },
      { text: 'Distilled structured outputs' },
      { text: 'Agent discovery and invocation' },
    ],
    rule: 'Mirror the service layer. Do not make MCP the source of truth.',
  },
];

if (toolingRoot) {
  const layerGroups = toolingRoot.querySelectorAll('g[data-tooling-layer]');
  const connections = toolingRoot.querySelectorAll('path[data-tooling-connection]');
  const steps = toolingRoot.querySelectorAll('circle[data-tooling-step]');
  const detailTitle = toolingRoot.querySelector('#tooling-detail-title');
  const detailSubtitle = toolingRoot.querySelector('#tooling-detail-subtitle');
  const detailDesc = toolingRoot.querySelector('#tooling-detail-desc');
  const detailItems = toolingRoot.querySelector('#tooling-detail-items');
  const detailRuleText = toolingRoot.querySelector('#tooling-detail-rule-text');
  let locked = false;

  const setToolingLayer = layerId => {
    const layer = toolingLayers.find(candidate => candidate.id === layerId);
    if (!layer) {
      return;
    }

    layerGroups.forEach(group => {
      const id = group.getAttribute('data-tooling-layer');
      const candidate = toolingLayers.find(item => item.id === id);
      const isActive = id === layerId;
      const rect = group.querySelector('rect');
      const texts = group.querySelectorAll('text');

      group.setAttribute('opacity', isActive ? '1' : '0.48');
      rect.setAttribute('stroke-width', isActive ? '2.5' : '1');
      rect.setAttribute('fill-opacity', isActive ? '0.16' : '0.08');
      texts.forEach(text => {
        text.setAttribute('fill', isActive && candidate ? candidate.color : 'currentColor');
      });
    });

    connections.forEach(connection => {
      const isActive =
        connection.getAttribute('data-tooling-from') === layerId ||
        connection.getAttribute('data-tooling-to') === layerId;

      connection.setAttribute('stroke-opacity', isActive ? '0.55' : '0.2');
      connection.setAttribute('stroke-width', isActive ? '2' : '1.5');
    });

    steps.forEach(step => {
      step.setAttribute('r', step.getAttribute('data-tooling-step') === layerId ? '8' : '6');
      step.setAttribute('opacity', step.getAttribute('data-tooling-step') === layerId ? '1' : '0.45');
    });

    detailTitle.style.setProperty('color', layer.color, 'important');
    detailTitle.textContent = layer.label;
    detailSubtitle.textContent = layer.sublabel;
    detailDesc.textContent = layer.description;
    detailRuleText.textContent = layer.rule;
    detailItems.innerHTML = '';
    layer.items.forEach(item => {
      const text = document.createElement('li');
      text.setAttribute('nve-text', 'body sm');
      text.textContent = item.text;
      detailItems.appendChild(text);
    });
  };

  setToolingLayer('metadata');

  layerGroups.forEach(group => {
    group.addEventListener('click', () => {
      locked = true;
      setToolingLayer(group.getAttribute('data-tooling-layer'));
    });
    group.addEventListener('mouseenter', () => {
      if (!locked) {
        setToolingLayer(group.getAttribute('data-tooling-layer'));
      }
    });
  });

  toolingRoot.querySelector('svg').addEventListener('mouseleave', () => {
    locked = false;
  });
}
</script>

## Build Inside Out

- **Metadata** is the durable contract. Generate facts once, then let docs, lint, CLI, skills, apps, and MCP consume them. If a fact exists only in a prompt, README, or tool description, the harness does not own it.
- **Static tools** for when agents repeat a mistake: type or schema, lint rule, test, CLI validation, MCP tool. If CI cannot enforce a rule that a parser can see, the harness is incomplete.
- **CLI and skills** to adapt the deterministic layer for humans and agent workflows. The CLI proves a capability without chat context. Skills should carry workflow order and project policy, not duplicate API catalogs.
- **MCP and MCP Apps** expose existing services to agents through narrow schemas, structured outputs, and explicit side-effect annotations. They should mirror the service layer, not own domain logic.

## Layering Rules

{% dodont %}

<div>

- **Start with metadata.** Add or fix the generated fact before building consumers.
- **Fail statically.** Prefer lint, types, and tests for any rule a parser can verify.
- **Prove with CLI.** Make the command usable by humans before agents call it.
- **Guide with skills.** Put workflow order, repository policy, and validation habits in skills.
- **Expose through MCP last.** Use MCP as a focused access point over existing services and standardized functionality.

</div>
<div>

- **Do not hide facts in prompts.** Prompts are runtime hints, not durable data.
- **Do not make MCP the source of truth.** Treat it as an adapter over services.
- **Do not ship model-only validation.** If CI cannot enforce it, the harness is incomplete.
- **Do not return raw dumps.** Distill context before it reaches the agent.

</div>

{% enddodont %}

## Decision Checklist

Before creating a new agent-facing tool, answer these questions:

- What metadata does this tool need, and where is that metadata generated?
- Which invalid states can type checking, JSON Schema, linting, or tests reject first?
- Can a human use the same capability through the CLI without chat context?
- Does the tool have a bounded input schema and a structured output schema?
- Is the result distilled for the task, or does it push context cleanup onto the model?
- Is this capability general enough for MCP, or is it only workflow context for a skill?
- What test fails if the tool disappears, changes shape, or starts returning stale data?

If the answer starts with "tell the model to remember," stop. Build the harness layer that makes remembering unnecessary.

## Related Docs

- [Agent Harness](/docs/internal/guidelines/agent-harness/)
- [Documentation Guidelines](/docs/internal/guidelines/documentation/)
- [Examples Guidelines](/docs/internal/guidelines/examples/)
- [CLI](/docs/cli/)
- [MCP](/docs/mcp/)
- [Lint](/docs/lint/)

---
{
  title: 'Agent Ownership',
  description: 'Internal guidelines for professional ownership of AI-assisted engineering work.',
  layout: 'docs.11ty.js'
}
---

# {{title}}

Agent-assisted work is still engineering work. The agent can draft code, search a repository, run tools, and expose options faster than a person can type. It cannot own the result. Ownership stays with the engineer who ships the change.

Using an agent to explore an idea, prototype UI, inspect an API, or generate boilerplate is useful. Shipping output without understanding it, testing it, and making the system reject the known failure modes is shipping unowned risk.

## Levels of Accountability

The agent can help in the workflow. Accountability stays attached to the engineer from intent through review.

<section id="ownership-accountability-rail" nve-layout="grid gap:xl span-items:12 &lg|span-items:6 align:vertical-center">
  <svg width="100%" height="560" viewBox="0 0 520 560">
    <defs>
      <marker id="ownership-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" fill-opacity="0.45"></path>
      </marker>
    </defs>
    <text x="24" y="32" fill="currentColor" fill-opacity="0.55" font-size="11">problem framing</text>
    <text x="24" y="532" fill="currentColor" fill-opacity="0.55" font-size="11">reviewable change</text>
    <line x1="72" y1="86" x2="72" y2="486" stroke="currentColor" stroke-opacity="0.24" stroke-width="2"></line>
    <g data-ownership-layer="intent" style="cursor:pointer">
      <rect x="140" y="50" width="320" height="72" rx="8" fill="var(--nve-ref-color-blue-cobalt-1000)" fill-opacity="0.08" stroke="var(--nve-ref-color-blue-cobalt-1000)" stroke-width="1"></rect>
      <text x="300" y="82" text-anchor="middle" fill="var(--nve-ref-color-blue-cobalt-1000)" font-size="15" font-weight="700">Intent</text>
      <text x="300" y="106" text-anchor="middle" fill="var(--nve-ref-color-blue-cobalt-1000)" font-size="10">Engineer Framing</text>
    </g>
    <path data-ownership-connection data-ownership-from="intent" data-ownership-to="draft" d="M 300 122 L 300 150" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5" marker-end="url(#ownership-arrow)"></path>
    <g data-ownership-layer="draft" style="cursor:pointer">
      <rect x="140" y="150" width="320" height="72" rx="8" fill="var(--nve-ref-color-green-grass-1000)" fill-opacity="0.08" stroke="var(--nve-ref-color-green-grass-1000)" stroke-width="1"></rect>
      <text x="300" y="182" text-anchor="middle" fill="var(--nve-ref-color-green-grass-1000)" font-size="15" font-weight="700">Agent Draft</text>
      <text x="300" y="206" text-anchor="middle" fill="var(--nve-ref-color-green-grass-1000)" font-size="10">Useful Assist</text>
    </g>
    <path data-ownership-connection data-ownership-from="draft" data-ownership-to="edit" d="M 300 222 L 300 250" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5" marker-end="url(#ownership-arrow)"></path>
    <g data-ownership-layer="edit" style="cursor:pointer">
      <rect x="140" y="250" width="320" height="72" rx="8" fill="var(--nve-ref-color-yellow-amber-1100)" fill-opacity="0.08" stroke="var(--nve-ref-color-yellow-amber-1100)" stroke-width="1"></rect>
      <text x="300" y="282" text-anchor="middle" fill="var(--nve-ref-color-yellow-amber-1100)" font-size="16" font-weight="700">Engineering Pass</text>
      <text x="300" y="306" text-anchor="middle" fill="var(--nve-ref-color-yellow-amber-1100)" font-size="10">Human Judgment</text>
    </g>
    <path data-ownership-connection data-ownership-from="edit" data-ownership-to="gates" d="M 300 322 L 300 350" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5" marker-end="url(#ownership-arrow)"></path>
    <g data-ownership-layer="gates" style="cursor:pointer">
      <rect x="140" y="350" width="320" height="72" rx="8" fill="var(--nve-ref-color-purple-violet-1000)" fill-opacity="0.08" stroke="var(--nve-ref-color-purple-violet-1000)" stroke-width="1"></rect>
      <text x="300" y="382" text-anchor="middle" fill="var(--nve-ref-color-purple-violet-1000)" font-size="15" font-weight="700">Harness Gates</text>
      <text x="300" y="406" text-anchor="middle" fill="var(--nve-ref-color-purple-violet-1000)" font-size="10">Tests, Types, Lint</text>
    </g>
    <path data-ownership-connection data-ownership-from="gates" data-ownership-to="review" d="M 300 422 L 300 450" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.5" marker-end="url(#ownership-arrow)"></path>
    <g data-ownership-layer="review" style="cursor:pointer">
      <rect x="140" y="450" width="320" height="72" rx="8" fill="var(--nve-ref-color-neutral-1000)" fill-opacity="0.08" stroke="var(--nve-ref-color-neutral-1000)" stroke-width="1"></rect>
      <text x="300" y="482" text-anchor="middle" fill="var(--nve-ref-color-neutral-1000)" font-size="15" font-weight="700">Review</text>
      <text x="300" y="506" text-anchor="middle" fill="var(--nve-ref-color-neutral-1000)" font-size="10">Risk Inspection</text>
    </g>
    <circle data-ownership-step="intent" cx="72" cy="86" r="6" fill="var(--nve-ref-color-blue-cobalt-1000)"></circle>
    <circle data-ownership-step="draft" cx="72" cy="186" r="6" fill="var(--nve-ref-color-green-grass-1000)"></circle>
    <circle data-ownership-step="edit" cx="72" cy="286" r="6" fill="var(--nve-ref-color-yellow-amber-1100)"></circle>
    <circle data-ownership-step="gates" cx="72" cy="386" r="6" fill="var(--nve-ref-color-purple-violet-1000)"></circle>
    <circle data-ownership-step="review" cx="72" cy="486" r="6" fill="var(--nve-ref-color-neutral-1000)"></circle>
    <text x="54" y="286" text-anchor="middle" fill="currentColor" fill-opacity="0.72" font-size="13" font-weight="700" transform="rotate(-90 54 286)">engineer accountability</text>
  </svg>
  <section id="ownership-detail-card" nve-layout="column gap:lg" style="margin-bottom: 48px;">
    <div nve-layout="column gap:sm">
      <h3 id="ownership-detail-title" nve-text="heading xl semibold"></h3>
      <p id="ownership-detail-subtitle" nve-text="label lg muted"></p>
    </div>
    <div nve-layout="column gap:lg">
      <p id="ownership-detail-desc" nve-text="body"></p>
      <ul id="ownership-detail-items" nve-text="list" nve-layout="column gap:sm pad:md"></ul>
      <span id="ownership-detail-rule-text" nve-text="body muted"></span>
    </div>
  </section>
</section>

<script type="module">
const ownershipRoot = document.getElementById('ownership-accountability-rail');
const ownershipStages = [
  {
    id: 'intent',
    label: 'Intent',
    sublabel: 'Engineer Framing',
    color: 'var(--nve-ref-color-blue-cobalt-1000)',
    description: 'The engineer defines the problem, invariant, and boundaries before asking an agent for output.',
    items: [
      { text: 'Name the user or system behavior' },
      { text: 'Set the smallest useful scope' },
      { text: 'Identify the risk before code exists' },
      { text: 'Choose what evidence will prove the change' },
    ],
    rule: 'If the goal is vague, the generated output will be vague.',
  },
  {
    id: 'draft',
    label: 'Agent Draft',
    sublabel: 'Useful Assist',
    color: 'var(--nve-ref-color-green-grass-1000)',
    description: 'The agent can produce a draft, search faster, and expose options. The draft is input to engineering judgment, not proof of quality.',
    items: [
      { text: 'Treat generated code as code you do not trust yet' },
      { text: 'Read the diff' },
      { text: 'Keep only what serves the design' },
      { text: 'Delete plausible but unnecessary structure' },
    ],
    rule: 'The agent contributes material. The engineer decides what survives.',
  },
  {
    id: 'edit',
    label: 'Engineering Pass',
    sublabel: 'Human Judgment',
    color: 'var(--nve-ref-color-yellow-amber-1100)',
    description: 'The engineer turns generated material into owned code by reading, reducing, correcting, and aligning it with the system.',
    items: [
      { text: 'Explain every surviving line' },
      { text: 'Match existing repository patterns' },
      { text: 'Remove incidental complexity' },
      { text: 'Make impossible states impossible' },
    ],
    rule: 'Tools assist the work. Engineers own the result.',
  },
  {
    id: 'gates',
    label: 'Harness Gates',
    sublabel: 'Tests, Types, Lint',
    color: 'var(--nve-ref-color-purple-violet-1000)',
    description: 'Deterministic gates preserve ownership after the author moves on. Repeated agent mistakes should become rules the repository rejects.',
    items: [
      { text: 'Add the test that fails for the likely bug' },
      { text: 'Use types to reject invalid states' },
      { text: 'Add lint or validation for repeated mistakes' },
      { text: 'Document context that future maintainers need' },
    ],
    rule: 'If the repository can enforce it, do not leave it to memory.',
  },
  {
    id: 'review',
    label: 'Review',
    sublabel: 'Risk Inspection',
    color: 'var(--nve-ref-color-neutral-1000)',
    description: 'Review should inspect named risk, architecture, behavior, and test evidence. It should not reconstruct basic intent from a large generated diff.',
    items: [
      { text: 'Keep the diff small enough to reason about' },
      { text: 'Show the behavioral evidence' },
      { text: 'Call out tradeoffs and boundaries' },
      { text: 'Treat unclear ownership as a blocker' },
    ],
    rule: 'Review validates owned work. It does not create ownership for the author.',
  },
];

if (ownershipRoot) {
  const layerGroups = ownershipRoot.querySelectorAll('g[data-ownership-layer]');
  const connections = ownershipRoot.querySelectorAll('path[data-ownership-connection]');
  const steps = ownershipRoot.querySelectorAll('circle[data-ownership-step]');
  const detailTitle = ownershipRoot.querySelector('#ownership-detail-title');
  const detailSubtitle = ownershipRoot.querySelector('#ownership-detail-subtitle');
  const detailDesc = ownershipRoot.querySelector('#ownership-detail-desc');
  const detailItems = ownershipRoot.querySelector('#ownership-detail-items');
  const detailRuleText = ownershipRoot.querySelector('#ownership-detail-rule-text');
  let locked = false;

  const setOwnershipStage = stageId => {
    const stage = ownershipStages.find(candidate => candidate.id === stageId);
    if (!stage) {
      return;
    }

    layerGroups.forEach(group => {
      const id = group.getAttribute('data-ownership-layer');
      const candidate = ownershipStages.find(item => item.id === id);
      const isActive = id === stageId;
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
        connection.getAttribute('data-ownership-from') === stageId ||
        connection.getAttribute('data-ownership-to') === stageId;

      connection.setAttribute('stroke-opacity', isActive ? '0.55' : '0.2');
      connection.setAttribute('stroke-width', isActive ? '2' : '1.5');
    });

    steps.forEach(step => {
      const isActive = step.getAttribute('data-ownership-step') === stageId;
      step.setAttribute('r', isActive ? '8' : '6');
      step.setAttribute('opacity', isActive ? '1' : '0.45');
    });

    detailTitle.style.setProperty('color', stage.color, 'important');
    detailTitle.textContent = stage.label;
    detailSubtitle.textContent = stage.sublabel;
    detailDesc.textContent = stage.description;
    detailRuleText.textContent = stage.rule;
    detailItems.innerHTML = '';
    stage.items.forEach(item => {
      const text = document.createElement('li');
      text.setAttribute('nve-text', 'body sm');
      text.textContent = item.text;
      detailItems.appendChild(text);
    });
  };

  setOwnershipStage('intent');

  layerGroups.forEach(group => {
    group.addEventListener('click', () => {
      locked = true;
      setOwnershipStage(group.getAttribute('data-ownership-layer'));
    });
    group.addEventListener('mouseenter', () => {
      if (!locked) {
        setOwnershipStage(group.getAttribute('data-ownership-layer'));
      }
    });
  });

  ownershipRoot.querySelector('svg').addEventListener('mouseleave', () => {
    locked = false;
  });
}
</script>

## Ownership Means

Owning an agent-assisted change means you can defend the implementation from first principles.

- **Intent:** You know why the change exists and which user, API, or system behavior it serves.
- **Design:** You chose the public API, boundaries, state model, and failure behavior deliberately.
- **Correctness:** You tested happy paths, invalid states, edge cases, and integration behavior that can regress.
- **Maintainability:** You removed incidental complexity, dead code, speculative abstraction, and unexplained patterns.
- **Review:** You kept the diff small enough for another engineer to reason about the risk.
- **Automation:** You strengthened the harness when the same failure can recur.

The prompt is not evidence. Passing tests are not evidence if the tests do not assert the risk. Review approval is not evidence if nobody can explain the behavior. The evidence is the code, the tests, the static gates, and the engineer's command of the system.

## Professional Use Of AI Agents

Use agents to speed up the loop. Do not use them to outsource judgment.

{% dodont %}

<div>

- **Start with the invariant.** Decide what must stay true before generating code.
- **Constrain the task.** Ask for the smallest useful change, then inspect the result.
- **Read the diff.** Review generated code with the same care as hand-written code.
- **Delete aggressively.** Keep the solution small, local, and aligned with existing patterns.
- **Test the risk.** Add the test that would fail for the mistake that concerns you.
- **Strengthen the harness.** Turn repeated guidance into lint, types, tests, metadata, or CLI validation.

</div>
<div>

- **Do not ship prompts.** Prompts are not governance, documentation, or a validation strategy.
- **Do not accept generated architecture blindly.** The agent does not know the long-term cost.
- **Do not hide behind the model.** The engineer owns the change, not the tool.
- **Do not merge code nobody can explain.** Plausible code is not the same as correct code.
- **Do not rely on style review.** Review the behavioral and architectural risk first.
- **Do not normalize flakes.** A flaky gate is a missing gate.

</div>

{% enddodont %}

Do not make review discover basic ownership. Professional software engineering means taking responsibility for consequences, not producing code-shaped output.

Agents are most useful when the repository has a strong harness: strict types, lint rules, deterministic tests, clear package boundaries, generated metadata, reviewable diffs, and engineers who understand the systems they change. Without that harness, agents only increase the rate at which weak process reaches production.

## Related Docs

- [Agent Harness](/docs/internal/guidelines/agent-harness/)
- [Agent Tooling](/docs/internal/guidelines/agent-tooling/)
- [Documentation Guidelines](/docs/internal/guidelines/documentation/)

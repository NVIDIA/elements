---
name: audit-consolidation
description: Audit an Elements project or directory for one concept implemented or owned in more than one place, including duplicate or parallel implementations that should share one internal module, related code scattered across feature directories, and older paths made redundant by newer ones. Use when the user asks for a consolidation or architecture cleanup audit, asks whether two components or utilities do the same thing, says a change keeps needing coordinated edits in more than one place, wants shared implementation candidates, or wants a plan to reduce maintenance complexity. Do not use for reviewing a diff or staged changes (use audit-code) or for removing copy-pasted text only.
---

# Audit Consolidation

Find high-confidence changes that reduce the number of places a maintainer must understand or update for one concept. Favor cohesive ownership and simpler invariants over mechanically maximizing reuse.

Use `audit-simplification` instead when the primary question is whether state, indirection, lifecycle plumbing, synchronization, or another mechanism needs to exist at all. When both questions apply, run the simplification audit first; removing a mechanism often removes the duplication question with it.

## Scope and Authorization

- Analyze the project or directory the user names. If they name no target, infer the smallest reasonable scope from the current request and repository state; ask only when materially different scopes are equally plausible.
- Treat the audit as read-only. Do not edit code merely because the audit finds an opportunity. Make a refactor only when the user explicitly asks for changes.
- Read the root `AGENTS.md` and any nearer agent instructions. Before analyzing a project, inspect its `DEVELOPMENT.md`, `package.json`, architecture notes, public entrypoints, and directory structure when present.
- Treat each project's `package.json` `exports` as its published boundary. Packages also export their `/internal` entrypoints, and sibling packages depend on them; for example, most other projects import `@nvidia-elements/core/internal`. Before calling anything unused or safe to move, search every project under `projects/`, including starters, site docs, `*.examples.ts` files, and `projects/internals/patterns`.
- Preserve unrelated working-tree changes. Generated output, third-party code, dependency trees, build artifacts, snapshots, and coverage output are out of scope unless the user explicitly includes them.

## Build an Evidence-Based Model

Start with a structural inventory, then follow behavior rather than relying on filenames or textual similarity alone.

1. Map source directories, public and internal entrypoints, package boundaries, tests, and major dependency directions.
2. Group code by the concept or invariant it owns: input normalization, validation, state transitions, resource lifecycle, data representation, rendering preparation, caching, serialization, error policy, or orchestration.
3. Trace imports, exports, call sites, tests, and data flow for suspected overlaps. Search for synonymous names and operations with the same result, not only exact identifiers.
4. Compare the implementations closely enough to identify their shared contract and intentional differences. When history would clarify why they diverged, `git log -S '<symbol>'` finds the commits that added or removed a symbol, and `git log -L '<start>,<end>:<file>'` follows one range of lines.
5. Check every proposed destination against package layering, public API, side-effect registration, dependency rules, and likely cycle creation. `projects/site/src/docs/api-design/packaging.md` describes the entrypoint and side-effect conventions.

Use repository search and small, targeted inspections first. AST, dependency-graph, clone-detection, coverage, or history tools may support the audit, but tool output is evidence to verify rather than a finding by itself.

## What Qualifies

Report an opportunity when two or more concrete signals point to one of these shapes:

- **Co-location:** pieces of one responsibility or lifecycle live across feature directories, forcing coordinated changes or obscuring ownership.
- **Shared implementation:** separate paths encode the same stable policy, transformation, state machine, data layout, resource management, or error behavior.
- **Canonical owner:** competing representations or helpers can converge on one existing source of truth.
- **Dead-path removal:** a newer shared path makes an older adapter, compatibility layer, or parallel implementation unnecessary.
- **Boundary correction:** shared low-level behavior lives in a feature-specific location, creating inverted dependencies or copy-and-adapt reuse.

Strong evidence includes repeated bug fixes, the same invariant tested in two or more places, parallel changes in history, duplicated constants or formats, adapters translating between matching representations, and consumers that must coordinate updates.

Do not recommend consolidation based only on similar syntax, a repeated small idiom, or matching names. Keep implementations separate when differences represent real domain policy, platform boundaries, performance specialization, independent release boundaries, intentionally isolated tests or examples, or a likely future divergence. Reject abstractions that introduce cycles, widen a public API, centralize unrelated volatility, or require more indirection than they remove.

## Choose the Smallest Useful Remedy

For each candidate, compare these remedies and recommend the least ambitious one that creates clear ownership:

1. Move closely related code beside its owner without adding an abstraction.
2. Make one implementation canonical and adapt its consumers.
3. Extract a narrowly named internal module around a stable contract.
4. Delete a redundant path after migrating its consumers.
5. Keep the implementations separate and document the reason when consolidation would be harmful.

Prefer one-way dependencies and feature-neutral internal locations. Name a shared module after the concept it owns. Existing `internal/utils/` directories, such as `projects/core/src/internal/utils`, are the deliberate home for small feature-neutral functions; do not introduce new vague buckets such as `common`, `shared`, or `helpers`.

## Rank Findings

Rank opportunities using all four factors:

- **Evidence:** strength of the demonstrated semantic overlap and affected call sites.
- **Payoff:** reduction in duplicated policy, coordinated edits, representations, or lifecycle ownership.
- **Confidence:** certainty that differences are accidental rather than intentional.
- **Risk:** migration size, behavioral sensitivity, package/API impact, performance impact, and dependency disruption.

Assign each finding a priority:

- **P1:** strong evidence and clear payoff at low-to-moderate risk; worth doing next.
- **P2:** worthwhile, but larger, riskier, or waiting on a user decision.
- **P3:** minor payoff; worth doing alongside related work.

Return a few actionable findings rather than an exhaustive list of weak similarities. Omit speculative ideas or list them briefly under **Keep** with the evidence that would change the verdict.

## Report

Use this structure. `audit-simplification` shares it so that both audits of one project read side by side.

### Scope Analyzed

Name the directories, entrypoints, exclusions, consumer search scope, and important architectural constraints examined.

### Findings

List findings in priority order. For each include:

- a concise title, priority, and confidence (high, medium, or low)
- exact source locations with line numbers
- the shared concept or invariant
- evidence from implementations and consumers
- intentional differences that must survive
- the recommended owner, destination, and dependency direction
- the smallest safe migration sequence
- expected maintenance benefit
- risks and tests needed to preserve behavior

### Keep

Call out tempting similarities that should remain separate, with the reason, so a future cleanup does not repeat the same investigation.

### Recommended Starting Point

Choose one bounded first refactor, explain why it has the best payoff-to-risk ratio, and state any decision the user must make before implementation. If no worthwhile consolidation exists, say so and summarize the evidence instead of inventing work.

## When the User Asks for Changes

Address one agreed opportunity at a time unless the user explicitly requests a broader migration. Preserve behavior and public API unless the user authorizes a change.

- Read the relevant repository guidelines before editing.
- Establish targeted tests or another observable baseline before moving behavior. Preserve intentional differences identified by the audit.
- Move consumers incrementally toward the canonical owner, remove the redundant path only after a search across every project under `projects/` shows no remaining consumers, and avoid opportunistic cleanup.
- Run the target project's documented lint, type, build, and test commands through `mise`, then run `git diff --check`. Run the affected sibling projects' tests when an `/internal` export moves, and use broader CI when the package boundary, public surface, or shared infrastructure changes.
- Summarize the ownership change, validation, and any deferred candidates. Do not claim reduced duplication if parallel implementations remain without explanation.

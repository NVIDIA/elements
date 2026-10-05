---
name: audit-simplification
description: Audit an Elements project, directory, or component for mechanisms that may not need to exist, including redundant state, attribute reflection, forwarding indirection, lifecycle plumbing, per-instance allocations, and custom synchronization that duplicates browser or Lit behavior. Use when the user says code feels over-engineered or heavier than it should be, asks whether a controller, field, service, or reflected attribute is necessary, or wants to reduce runtime overhead, memory, or boilerplate. Do not use for reviewing a diff or staged changes (use audit-code) or for deciding where duplicate code should live (use audit-consolidation).
---

# Audit Simplification

Find removable mechanisms while preserving required observable behavior. Favor fewer concepts, allocations, synchronization paths, and lifecycle responsibilities.

## Scope and Authorization

- Analyze the project or directory the user names. If they name no target, infer the smallest reasonable scope from the request and repository state.
- Treat an audit as read-only. Edit only when the user explicitly asks for implementation.
- Read the root `AGENTS.md`, nearer agent instructions, and the target project's `DEVELOPMENT.md` before analyzing. `DEVELOPMENT.md` lists the test types the project runs, which shows which observable behavior is already covered. Read additional required guidelines for the files or APIs in scope.
- Preserve unrelated working-tree changes.
- Preserve published API unless the user authorizes a breaking change. Treat each project's `package.json` `exports` as its published boundary. Packages also export their `/internal` entrypoints, and sibling packages depend on them; for example, most other projects import `@nvidia-elements/core/internal`. Before calling anything unused or unpublished, search every project under `projects/`, including starters, site docs, `*.examples.ts` files, and `projects/internals/patterns`.

Use `audit-consolidation` instead when the main question is where duplicate or shared responsibility should live. Use this skill when the earlier question is whether a mechanism or responsibility needs to exist at all. When both apply, run this audit first; removing a mechanism often removes the duplication question with it.

## Establish the Observable Contract

Before proposing removal, identify the behavior that must survive:

- public properties, attributes, slots, methods, events, and exports
- CSS selectors, accessibility semantics, external observers, SSR, or serialization that depend on DOM state
- connection, disconnection, host replacement, and resource cleanup behavior
- ordering, isolation, caching, and error-reporting guarantees
- tests that assert externally observable behavior rather than implementation structure

Do not keep internal machinery merely because a test describes it. Preserve required behavior and update implementation-coupled tests when the user authorizes the simplification.

## Inspect for Removable Mechanisms

Trace reads, writes, construction sites, call sites, cleanup paths, and platform behavior. Use the following lenses as prompts, not assumptions that every match warrants removal.

### Property and Attribute Duplication

Inspect property reflection, normalization, converters, and property-to-attribute synchronization. Determine whether declarative input, CSS selectors, accessibility, external observation, SSR, or serialization needs the attribute.

Accepting an attribute as input does not require reflecting later property changes back to it. `projects/site/src/docs/api-design/properties-attributes.md` sets the repository rule: reflect only when the attribute serves as a style hook or another observable purpose, and never reflect object or array properties. Recommend removing reflection or normalization only when it has no required observable purpose.

### Dependency Indirection

Look for:

- callbacks that only return a public host member
- options that are always passed the same constant
- methods that only forward arguments to another object
- return values that all callers ignore
- abstractions with one implementation and no meaningful substitution or test seam

Prefer direct access when it does not introduce coupling beyond the dependency already present.

### Lifecycle Ownership

Find paired operations such as event listener registration and removal, binding and unbinding, or resource acquisition and release. The object that owns the behavior should normally own its setup and cleanup.

When a Lit host owns behavior, consider a `ReactiveController` if the behavior's lifetime naturally follows host connection and disconnection. Do not introduce a controller merely to move unrelated code.

### Stored-State Necessity

Trace fields and collections through both reads and writes. Flag state that is:

- written but never meaningfully read
- reset only because it exists
- retained after an event has already communicated the outcome
- used only to compute an ignored return value
- duplicated by another authoritative source

Remove the state and its maintenance paths together.

### Instance Cardinality and Allocation

Search for every construction site of significant classes. Determine whether the state is genuinely per-instance, per-host, per-device, per-document, or realm-wide.

A shared service is appropriate when it represents one shared facility, host behavior can remain isolated through explicit identity keys, and shared ownership does not leak elements or test state. Prefer lazy allocation and `WeakMap` storage for state keyed by externally owned objects.

Do not turn every module-level cache, adapter, controller, or state store into a service. Keep domain-local implementation details beside their owner when shared dependency injection provides no benefit.

### Native Platform Replacement

Look for custom synchronization that duplicates browser or Lit behavior, including manual slot distribution, mutation-driven redistribution, attribute mirroring, lifecycle forwarding, and bookkeeping for native DOM state.

During the audit, cite the platform behavior the replacement would rely on and any existing tests that cover it. When no test covers it, mark the finding as needing verification; writing that focused test becomes the first implementation step. Keep custom behavior when it intentionally differs from the platform default.

### Naming and Placement

Check whether names and locations accurately communicate responsibility and cardinality:

- per-host Lit lifecycle behavior generally belongs in `*.controller.ts`
- a shared singleton dependency generally belongs in `*.service.ts`
- domain-local caches and platform adapters should remain near their subsystem
- rendering, content management, and input behavior should remain separate when they have different lifecycles or dependencies

Renaming alone is not a simplification unless it makes ownership or cardinality clearer.

## Guardrails

Do not recommend removal when:

- reflection supports CSS, accessibility, serialization, or external observers
- separate instances provide required isolation, ordering, or namespaces
- a singleton would introduce SSR, cross-document, test, or global-state leakage
- manual DOM behavior intentionally differs from native semantics
- lifecycle code must support hosts outside Lit
- the replacement adds more coupling or indirection than it removes

Tie performance findings to a concrete avoided allocation, listener, synchronization step, retained object, or hot-path operation. Label speculative performance benefits as such. When the user wants measured evidence, use the `authoring-benchmarks` skill rather than estimating.

## Rank Findings

Rank opportunities using all four factors:

- **Evidence:** strength of the demonstrated redundancy across reads, writes, and call sites.
- **Payoff:** concepts, allocations, listeners, synchronization paths, or lifecycle responsibilities removed.
- **Confidence:** certainty that no required observable behavior depends on the mechanism.
- **Risk:** migration size, behavioral sensitivity, package/API impact, and test churn.

Assign each finding a priority:

- **P1:** strong evidence and clear payoff at low-to-moderate risk; worth doing next.
- **P2:** worthwhile, but larger, riskier, or waiting on a user decision.
- **P3:** minor payoff; worth doing alongside related work.

Return a few high-confidence findings rather than an exhaustive list of weak possibilities.

## Report

Use this structure. `audit-consolidation` shares it so that both audits of one project read side by side.

### Scope Analyzed

Name the directories, entrypoints, exclusions, consumer search scope, and test types available in the project.

### Findings

List findings in priority order. For each include:

- a concise title, priority, and confidence (high, medium, or low)
- exact source locations and symbols
- the unnecessary mechanism and evidence of redundancy
- observable behavior that must survive
- the smallest safe simplification
- concrete runtime or maintenance benefit
- risks and focused validation

### Keep

Call out tempting mechanisms the audit found necessary, with the reason, so a future cleanup does not repeat the same investigation.

### Recommended Starting Point

Choose one bounded first simplification, explain why it has the best payoff-to-risk ratio, and state any decision the user must make before implementation. If no worthwhile simplification exists, say so and summarize the evidence instead of inventing work.

## When the User Asks for Changes

Apply one coherent opportunity at a time unless the user requests a broader migration.

- Establish a targeted behavioral baseline before editing.
- Remove obsolete state, callbacks, branches, tests, and imports without leaving parallel paths.
- Search every project under `projects/` for remaining construction sites, references, and old terminology.
- Run the target project's documented tests, type checking, linting, and build tasks as appropriate through `mise`, then run `git diff --check`. When reflection, slotting, or DOM synchronization changes, also run the project's `test:ssr`, `test:axe`, and `test:visual` tasks when it has them, since unit tests rarely catch those regressions.
- Summarize the removed mechanisms, preserved behavior, validation, and any deferred candidates.

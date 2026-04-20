# @internals/eslint

Shared ESLint configuration and custom rules for the Elements monorepo. Every project consumes its configs from here so TypeScript, JSON, HTML, and CSS lint behavior stays consistent.

Nothing in this package ships to npm. The `@internals/*` prefix marks it as workspace-private.

## Layout

```
src/
├── configs/         # Flat ESLint configs: typescript.js, json.js, html.js, css.js
├── local/           # Custom rules
│   ├── utils.js     # Shared AST helpers (walk, normalize, findEnclosingClass)
│   ├── require-*.js
│   ├── example-*.js
│   ├── no-*.js
│   └── *.test.js    # RuleTester + node:test, next to each rule
└── index.js         # Re-exports configs for consumers
```

Rules live as ESM default-exports of `Rule.RuleModule`. Tests run via `node --test src/local/*.test.js` against ESLint's `RuleTester`.

## Consuming

Each project's `eslint.config.js` imports the flat configs from `@internals/eslint`:

```js
import { browserTypescriptConfig, libraryConfig, litConfig, jsonConfig } from '@internals/eslint';
export default [...browserTypescriptConfig, ...libraryConfig, ...litConfig, ...jsonConfig];
```

Plugin namespaces (`local-typescript`, `local-html`, `local-css`, `local-json`) register the custom rules inside those configs. Projects do not opt in per rule.

## Authoring a new rule

1. Add `src/local/<rule-name>.js` that exports a `Rule.RuleModule`. Reach for `utils.js` for walking and class-lookup helpers.
2. Add `src/local/<rule-name>.test.js` using `RuleTester` + `node:test`. Cover at least one valid and one invalid case per `messageId`.
3. Register the rule in the matching `src/configs/*.js` file under the `local-<lang>` plugin and set its severity in the `rules` block.
4. Run `pnpm run test` from this package.

---

## Rule catalog

Grouped by the config that enables them.

### TypeScript rules (plugin `local-typescript`)

Applied to `src/**/*.ts`, `src/**/*.tsx`, test files, and `*.examples.ts`.

**Component API shape**

- **`require-component-metadata`**. Every component class must declare `static readonly metadata = { tag: 'nve-*', version }`. Flags missing metadata, missing fields, or tags that do not start with `nve-`.
- **`require-element-definitions`**. `nve-*` elements referenced in a component's template must appear in that component's `static elementDefinitions` so scoped registration works.
- **`require-internal-host`**. Each component's render root must carry the `internal-host` attribute so CSS parts and internal styling resolve correctly.
- **`require-composed-events`**. Any `CustomEvent` dispatched with `bubbles: true` must also set `composed: true`. Shadow DOM boundary crossing stays opt-in.
- **`reserved-property-names`**. Disallows `@property` / `@state` / `@event` names that collide with `HTMLElement` prototype keys, ARIA attributes, or native event handlers (case-insensitive).
- **`reserved-event-names`**. Disallows custom event names that collide with native HTMLElement events (`click`, `change`, `load`, …).
- **`primitive-property`**. Public `@property` members must use primitive types. The rule rejects `Array` and `Object` except for the `data`, `i18n`, and `stepSizes` conventions.
- **`stateless-property`**. The rule disallows `this.<publicProperty> = ...` assignments so public API stays read-only inside the component. `hidden` and `value` can still mutate for standard-element parity.

**Lifecycle resource cleanup**

- **`require-listener-cleanup`**. `addEventListener` inside `connectedCallback` must have a matching `removeEventListener` in `disconnectedCallback` (same target + event, by source text). Forbids `addEventListener` in the `constructor` since it runs once and `this.shadowRoot` stays `null`. Performs a depth-1 follow-through into private-method helpers (`this.#setupX()`) called from lifecycles.
- **`require-observer-cleanup`**. Flags `new (Resize|Mutation|Intersection|Performance)Observer(...)` whose result stays syntactically unreachable (for example `new ResizeObserver(fn).observe(this)`). Once the code assigns the observer to a field or pushes it into an array, the rule trusts the programmer for disposal.
- **`require-timer-cleanup`**. Flags `setInterval` without a stored handle (unstoppable), and `setInterval`/`setTimeout` stored on `this.foo`/`this.#foo` without a matching `clearInterval`/`clearTimeout` anywhere in the class. The rule leaves `setTimeout` one-shots without a stored handle untouched.

**Tests**

- **`require-fixture-cleanup`**. When a `describe` block's `beforeEach` calls `createFixture`, a sibling or ancestor `afterEach` must call `removeFixture`. Prevents DOM pollution across test suites.
- **`require-element-stable`**. `expect(...)` assertions on component state must follow `elementIsStable(...)` so Lit renders settle before reads.
- **`require-test-completeness`**. Every component source file must have its five sibling test files: `.test.ts`, `.test.axe.ts`, `.test.visual.ts`, `.test.ssr.ts`, `.test.lighthouse.ts`.

**Source hygiene**

- **`no-dead-code`**. Flags commented-out imports, exports, declarations, control-flow, and test blocks. The project currently sets this to `warn` during cleanup.

### Example rules (plugin `local-typescript`, files `**/*.examples.ts`)

Applied on top of the TypeScript ruleset for example files.

- **`example-metadata`**. Validates JSDoc on exported examples. `@summary` must exist, stay at or under 400 characters, avoid links and placeholder phrasing, avoid visual-language descriptors, and `@tags` must match allowed UX-guidance tags.
- **`example-naming`**. Example export names must use `PascalCase`, stay at or under 6 words, and avoid the component name prefix and blocklisted words like `Example` or `TestCase`.
- **`example-template-size`**. Template string length cap: 4,000 characters for components, 10,000 for patterns.
- **`example-css-quality`**. Inline CSS in example templates must stay under about 10% of template length (excluding sizing declarations) so the examples stay consumable by AI agents.
- **`example-approved-domains`**. External URLs in example templates must resolve to approved domains (`nvidia.com`, `github.com`) or stay relative.

### HTML and template rules (plugin `local-html`)

Applied to Lit template tagged literals via `@html-eslint/parser`.

- **`no-invalid-css-parts`**. `part` attributes may only appear on `nve-*` elements. Internal parts prefixed with `_` (for example `_internal-host`) stay allowed.
- **`required-css-parts`**. Slotted `nve-*` elements in a template must expose a `part` so consumers can style them.

### CSS rules (plugin `local-css`)

Applied to `src/**/*.css`.

- **`no-host-margin`**. Disallows `margin`, `margin-top/right/bottom/left`, and the logical `margin-block`/`margin-inline` variants on `:host`. External spacing belongs to the consumer.

### JSON rules (plugin `local-json`)

Applied to `package.json` files.

- **`no-unpinned-dependency-ranges`**. Private workspace packages must pin dependency versions (no `^` or `~`). Published packages must use ranges for runtime dependencies and pin their dev dependencies. `catalog:` and `catalog:publish` references have their own rules per publish state.

### Build and bundle rules

- **`no-missing-bundle-registration`**. A component that ships a `define.ts` must also appear in `src/bundle.ts` so the CDN bundle registers it.

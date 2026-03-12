---
name: repo-pattern-creation
description: Convert validated playground templates or HTML compositions into reusable pattern files (*.examples.ts) in the pattern library. Use this skill whenever the user wants to save, persist, store, or catalog a template, prototype, composition, or playground result as a reusable pattern. Trigger on phrases like "save as pattern," "create pattern," "add to pattern library," "persist this template," "convert to examples.ts," or when the user has validated HTML and wants it stored in projects/internals/patterns/src/.
---

# Pattern Creation

Persist a validated HTML template as a reusable pattern file in the Elements pattern library at `projects/internals/patterns/src/`.

## When to Use This Skill

- User wants to save a playground template as a reusable pattern
- User asks to persist, save, or store a composition in the codebase
- User wants to create a new pattern file from HTML
- User says "save as pattern," "create pattern," or "add to pattern library"
- User has a validated playground prototype and wants it cataloged

## Must Read Files

You MUST review these files before proceeding:

- [Examples Guidelines](projects/site/src/docs/internal/guidelines/examples.md) -- authoritative rules for naming, `@summary`, and structure
- Scan `projects/internals/patterns/src/*.examples.ts` to understand existing patterns and categories

## Workflow

### Phase 1: Locate Template

Find the validated HTML template to persist. Look for it in the conversation context:

1. Check for a recently validated HTML template from a playground workflow
2. Check for HTML the user has pasted or referenced
3. If no template exists, ask the user to provide the HTML they want to save

### Phase 2: Check Validity

Ensure the template is valid before proceeding.

1. Call `api_template_validate` with the template HTML
2. If validation returns errors, report them to the user and fix each issue
3. Re-validate until the result is clean (empty error array)
4. Do NOT proceed to Phase 3 until validation passes

### Phase 3: Generate Imports

Use the MCP tool to derive correct ESM import statements.

1. Call `api_imports_get` with the template HTML
2. The tool returns the required `@nvidia-elements/core/*/define.js` imports
3. Always prepend `import { html } from 'lit';` as the first import -- the tool does not include it

### Phase 4: Determine Metadata

Analyze the template and determine where and how to file it.

**Export name:**

- PascalCase, 1-3 words (per examples.md guidelines)
- Describes WHAT the pattern shows, not HOW it works
- Avoid component names in the title (use `LoginForm` not `InputPasswordLoginForm`)

**File name:**

- kebab-case with `.examples.ts` suffix
- Should reflect the pattern's theme or category

**Category (default export `title`):**

- Must use format `'Patterns/<Category>'`
- Check existing categories before creating new ones:

| Category           | File                                                                                     | Description                              |
| ------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| Authentication     | `authentication.examples.ts`                                                             | Login forms, access states               |
| Dashboard          | `dashboard.examples.ts`                                                                  | Monitoring dashboards, KPI views         |
| Examples           | `browse.examples.ts`, `panel.examples.ts`, `subheader.examples.ts`, `editor.examples.ts` | General compositions and layout patterns |
| Feedback           | `empty-states.examples.ts`                                                               | Empty states, error states, offline      |
| Heatmap            | `heatmap.examples.ts`                                                                    | Data visualization grids                 |
| Keyboard Shortcuts | `keyboard-shortcuts.examples.ts`                                                         | Keyboard shortcut displays               |
| Logging            | `logging.examples.ts`                                                                    | Log viewers and log-related UI           |
| Media              | `media.examples.ts`                                                                      | Media players, image galleries           |
| Responsive         | `responsive.examples.ts`                                                                 | Responsive layout patterns               |
| Search             | `search.examples.ts`                                                                     | Search interfaces                        |
| Trend              | `trend.examples.ts`                                                                      | Trend charts and metrics                 |

**Add-to-existing vs. create-new:**

- If an existing file matches the template's theme, add the new export to that file
- Only create a new file when no existing category fits
- Present the decision to the user for confirmation

### Phase 5: Write @summary

Compose a UX-focused JSDoc `@summary` for the pattern.

**Rules:**

- Max 400 characters
- One or two concise sentences
- Explain WHAT the pattern demonstrates, WHY the pattern helps, WHEN to use it, and HOW it improves UX
- Always include `@tags pattern`
- Derive design intent from template analysis: layout type, interaction pattern, use case, domain context
- When appropriate, reference NVIDIA or NVIDIA Autonomous Vehicle program for UX use cases

**Good examples:**

```
@summary Login form with email and password fields with credential validation. Use for authentication entry points where real-time feedback guides users through sign-in requirements.
@summary Data grid empty state with retry action. Use when requested data is not found and a retry action is available.
@summary Horizontal list item card with thumbnail, title, description, and icon button actions for browsable content lists.
```

**Avoid:**

- Restating what is obvious from the code (`@summary A card with a button`)
- Vague descriptions (`@summary Example pattern`)

### Phase 6: Assemble

Build the TypeScript file content.

**Determine render style:**

- If the template contains `<script>` tags: use the `render()` method form
- If the template uses only declarative HTML: use the `render: () => html\`...\`` arrow function form

**New file template:**

```typescript
import { html } from 'lit';
// ... generated imports from Phase 3

export default {
  title: 'Patterns/<Category>',
  component: 'nve-patterns'
};

/**
 * @summary <UX-focused description from Phase 5>
 * @tags pattern
 */
export const ExportName = {
  render: () => html`
    <!-- template HTML -->
  `
};
```

**New file template (with `<script>` tags):**

```typescript
import { html } from 'lit';
// ... generated imports from Phase 3

export default {
  title: 'Patterns/<Category>',
  component: 'nve-patterns'
};

/**
 * @summary <UX-focused description from Phase 5>
 * @tags pattern
 */
export const ExportName = {
  render() {
    return html`
    <!-- template HTML with <script> tags -->
    `
  }
};
```

**Adding to an existing file:**

1. Read the existing file
2. Merge imports -- add any new `@nvidia-elements/core/*/define.js` imports that are not already present, maintaining alphabetical order
3. Append the new named export at the end of the file
4. Do NOT change existing exports or the default export

### Phase 7: Write and Verify

1. Write the file to `projects/internals/patterns/src/<file-name>.examples.ts`
2. Confirm to the user with:
   - File path
   - Export name
   - Category
   - Components used (list of `nve-*` tags)
   - The `@summary` content

## References

- [Examples Guidelines](projects/site/src/docs/internal/guidelines/examples.md) -- naming, summary, structure rules
- [Authoring Guidelines](projects/internals/tools/src/context/authoring.md) -- HTML authoring rules for `nve-*` components
- Existing patterns: `projects/internals/patterns/src/*.examples.ts`

## Authoring Guidelines

**NEVER write nve-\* HTML from assumption—look up every API first.**

### Authoring UI Workflow

Best practices and guidelines for creating UI with NVIDIA Elements.

1. **Search** patterns and compositions (tools: `examples_list`, `examples_get`)
2. **Search** components and API documentation (tools: `api_list`, `api_get`)
3. **Write** the HTML using `nve-*` components (tools: `api_imports_get`)
4. **Check** the template (tools: `api_template_validate`)

### Best practices

- Prefer stateless/static HTML when possible
- Use plain HTML/CSS and JavaScript unless specifically requested (angular, react, vue, lit, etc)
- Do NOT use event handler content attributes such as `onclick` or `onchange` attributes. Use JavaScript event listeners instead.
- Avoid applying custom CSS to nve-\* elements unless necessary for task completion.
- Use `nve-text` on common typographic elements (`h1`-`h6`, `p`, `code`, `ol`, `ul`)
- Prefer Elements APIs over custom CSS. If you need CSS, use design tokens via the `tokens_list` tool.
- Verify that each Elements API usage is correct by checking the API documentation via the `api_get` tool.

### API Gotchas

- Use `nve-grid` for tabular data, lists, and keyboard-navigable collections. Do NOT use it for page layout, use `nve-page` and `nve-layout` instead.
- Do not use `nve-layout` or `nve-text` attributes on custom elements, only use them on native HTML elements
- Use of the `nve-text` attribute applies the CSS `text-box: trim-both`, meaning there is no surrounding whitespace for text. Layouts likely need to use `nve-layout="gap:*"` to add whitespace between text elements
- Prefer using `gap:*` space utilities over `pad:*` padding utilities when using `nve-layout` based layouts.
- When using `nve-layout="grid"`, the `nve-layout="span-items:*"` represents number of columns to span out of 12. Example: "span-items:6" spans 6 out of 12 columns or 50% of the grid row.

### Starter Layout

```html
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
    <h2 slot="prefix" nve-text="heading">Infrastructure</h2>
  </nve-page-header>
  <main nve-layout="column gap:lg pad:lg">
    <!-- template content here -->
  </main>
</nve-page>
```

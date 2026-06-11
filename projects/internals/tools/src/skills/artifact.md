## Creating an Artifact

Use this template when creating a standalone UI artifact that is likely throwaway, exploratory, or intended for direct display in an agent client.

Examples include:

- Claude Artifacts
- Codex or GPT Sites pages
- single-file HTML prototypes
- interface drafts
- quick dashboards
- demos
- visual design explorations
- temporary review artifacts

### Rule

Start from this exact standalone HTML shell for UI artifacts that use NVIDIA Elements:

```html
<!doctype html>
<html lang="en" nve-theme="dark" nve-transition="auto">
  <head>
    <title>NVIDIA Elements Artifact</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/styles/dist/bundles/index.css';
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/bundles/index.css';
      @import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/themes/dist/fonts/inter.css';
    </style>
    <script type="module">
      import 'https://cdn.jsdelivr.net/npm/@nvidia-elements/core/dist/bundles/index.min.js';
    </script>
  </head>
  <body nve-text="body">
  </body>
</html>
```

- Do not rush through the artifact. Review APIs available to you before implementing.
- Do not write CSS selectors that target `nve-*` elements.
- Do not override `nve-*` CSS custom properties unless the user explicitly requests visual theming.
- Do not replace built Elements components with native HTML equivalents for supported use cases.

### Workflow

1. Produce a complete HTML document unless the target artifact system requires only the body.
2. Keep the template imports intact.
3. Put the artifact UI inside `<body nve-text="body">`.
4. Prefer NVIDIA Elements components and `nve-layout` / `nve-text` utilities over custom CSS.
5. Use custom CSS only for artifact-specific composition, sizing, or visual polish.
6. Do not add a build step, framework, package install, or external UI library.
7. Do not write explanatory UI chrome unless the user asks for it.
8. Make the first screen the actual usable artifact, not a landing page.

### Body Pattern

When the artifact needs no stronger structure, start the body with:

```html
<main nve-layout="column gap:lg pad:lg">
  <!-- artifact content -->
</main>
```

Use native semantic HTML with Elements attributes for layout and typography. Use `nve-*` components when you know their APIs or can check them.

### Validation

Before finalizing:

- Verify the HTML is complete and valid.
- Check that every opened tag has a closing tag.
- Ensure visible text fits the intended layout.
- Ensure the artifact works without local dependencies.
- If using `nve-*` components, verify API names rather than guessing.

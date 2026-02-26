## Creating Elements Starter Project

Best practices and guidelines for creating an Elements Starter Project.

## MCP

Agents should prefer use of the MCP over the CLI when possible.

### Tools to use

- `project_create`: create a new starter project
- `project_setup`: setup or update a project to use Elements
- `project_validate`: check project setup and find configuration issues

### Gotchas

- Do NOT use the `start` parameter for `project_create` tool as this prevents the tool from exiting.

### Steps

1. Use the `project_create` tool to create a new starter project
2. Use the `project_setup` tool to update the project to the latest versions of Elements packages
3. Run `pnpm run dev` or `npm run dev` to start the project. This starts the project in development mode as a long-running process.
4. If there is an available Playwright MCP tool use it to verify the project locally is working as expected.

## CLI

The CLI and create packages provide CLI interfaces to spin up new projects.

```shell
npm create @nve STARTER_NAME
```

Optionally, install the Elements CLI globally then run the CLI:

```shell
npm install -g @nvidia-elements/cli@latest

nve project.create --type=STARTER_NAME
```

## Manual Integration for Existing Projects

If installing to an existing project, install the core dependencies:

```shell
# install core dependencies
npm install @nvidia-elements/themes @nvidia-elements/styles @nvidia-elements/core
```

Elements ships as many small packages. This allows you to choose what
tools your application needs and omit anything unnecessary, improving
application performance.

```css
/* base theme */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';

/* optional themes */
@import '@nvidia-elements/themes/high-contrast.css';
@import '@nvidia-elements/themes/reduced-motion.css';
@import '@nvidia-elements/themes/compact.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/themes/debug.css';

/* optional CSS utilities */
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/view-transitions.css';
```

```typescript
// Load via typescript imports to make available in HTML templates
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dot/define.js';
...
```

```html
<!-- set global theme -->
<html nve-theme="dark" nve-transition="auto">
```

```html
<!-- use component in HTML template -->
<nve-button>hello there</nve-button>
```

## Creating Elements Starter Project

Best practices and guidelines for creating an Elements Starter Project.

### Tools to use

- `project_create`: create a new starter project
- `project_setup`: setup or update a project to use Elements
- `project_validate`: check project setup and find configuration issues

### Gotchas

- Do NOT use the `start` parameter for `project_create` tool as this prevents the tool from exiting.

### Steps

1. Use `project_create` tool to create a new starter project
2. Use `project_setup` tool to update the project to the latest versions of Elements packages
3. Use `project_validate` tool to check project setup and find configuration issues
4. Run `pnpm run dev` or `npm run dev` to start the project. This starts the project in development mode as a long-running process.

## Setup an Existing Project

Setup an existing project to use Elements you can use the setup command to add the necessary dependencies and configure the MCP server.

```shell
# use the CLI
nve project.setup

# or use the MCP tool
project_setup
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
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/view-transitions.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';

/* optional themes */
@import '@nvidia-elements/themes/high-contrast.css';
@import '@nvidia-elements/themes/reduced-motion.css';
@import '@nvidia-elements/themes/compact.css';
@import '@nvidia-elements/themes/debug.css';
```

```typescript
// Load via typescript imports to make available in HTML templates
import '@nvidia-elements/core/button/define.js';
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

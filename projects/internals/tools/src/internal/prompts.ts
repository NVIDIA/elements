import { type Schema } from './tools.js';

const authoringContext = `
## Authoring Guidelines

### Best practices
- Prefer stateless/static HTML when possible
- Use plain HTML/CSS and JavaScript unless specifically requested (angular, react, vue, lit, etc)
- Do NOT use event handler content attributes such as \`onclick\` or \`onchange\` attributes. Use JavaScript event listeners instead.
- Avoid applying custom CSS to nve-* elements, only use them for native HTML elements
- Prefer Elements APIs over custom CSS. If CSS is required, use design tokens via the \`tokens_list\` tool.
- Verify that each Elements API usage is correct by checking the API documentation via the \`api_get\` or \`api_search\` tool

### API Gotchas
- Use \`nve-grid\` for tabular data, lists, and keyboard-navigable collections. Do NOT use it for page layout, use \`nve-page\` and \`nve-layout\` instead.
- Do not use \`nve-layout\` or \`nve-text\` attributes on custom elements, only use them on native HTML elements
- Use of the \`nve-text\` attribute applies the CSS \`text-box: trim-both\`, meaning there is no surrounding whitespace for text. Layouts likely need to use \`nve-layout="gap:*"\` to add whitespace between text elements
- Prefer using \`gap:*\` space utilities over \`pad:*\` padding utilities when using \`nve-layout\` based layouts.
- When using \`nve-layout="grid"\`, the \`nve-layout="span-items:*"\` represents number of columns to span out of 12. Example: "span-items:6" will span 6 out of 12 columns or 50% of the grid row.

### Starter Template

\`\`\`html
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">NVIDIA</h2>
  </nve-page-header>
  <main nve-layout="column gap:lg pad:lg">
    <!-- template content here -->
  </main>
</nve-page>
\`\`\`
`;

const aboutContext = `
## Elements Design System

Give a high level overview of the Elements Design System.

**Structure the content as:**
1. **What is Elements?** - Explain it's NVIDIA's design system for AI/Robotics applications, built for speed and scale
2. **Why use Elements?** - Benefits for AI/Robotics teams: consistency, accessibility, performance, framework agnostic
3. **Getting Started** - Where to get started with Elements
4. **Additional Resources** - Where to find additional resources for the Elements Design System

**Do NOT create any files** Just provide the content.

**Target audience:** Developers new to Elements, especially those working on AI/Robotics applications who need a robust, accessible design system.

**Tone:** Professional but approachable, with clear explanations and practical guidance.

**Length:** Comprehensive but digestible - break into logical sections that can be consumed incrementally.

### Getting Started with Elements

\`\`\`bash
# login to artifactory
npm config set registry https://registry.npmjs.org && npm login --auth-type=legacy
\`\`\`

\`\`\`bash
# create a new project
npm create @nve typescript # typescript, angular, react, lit, preact, solidjs, vue, nextjs, go
\`\`\`

### Resources for Users
- [Documentation](https://NVIDIA.github.io/elements/)
- [Gitlab Repo](https://github.com/NVIDIA/elements)
- [Slack Support](https://nvidia.slack.com/archives/C03BDL2UCGK)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)

### Resources for Agent - Available MCP Tools
- \`api_list\`: get list of all available Elements (nve-*) APIs and components
- \`api_search\`: search and retrieve Elements components and APIs using keywords
- \`api_get\`: get documentation for a specific component by name
- \`api_template_validate\`: validate HTML templates for correct API usage
- \`api_changelogs\`: get changelog details for a specific component or API
- \`packages_versions_list\`: get latest published versions of all Elements packages
- \`packages_changelogs_list\`: get changelogs for all @nve packages
- \`packages_changelogs_search\`: search for package changelogs by name
- \`examples_list\`: get list of available usage examples and code snippets
- \`examples_search\`: search examples by name, element type, or keywords
- \`playground_validate\`: validate HTML templates for playground demos
- \`playground_create\`: create a shareable playground URL from HTML template
- \`project_create\`: create a new starter project
- \`project_update\`: update project to latest Elements package versions
- \`project_validate\`: validate project setup and check for issues
- \`tokens_list\`: get available CSS variables / design tokens for theming
`;

const searchContext = `
## Searching and Providing Elements API Documentation

Explain the API in a way that is easy to understand and follow

### Tools to use
- Use the \`api_list\` tool to lookup available APIs before implementation
- Use the \`api_search\` tool to understand components and their API details before using them
- Use the \`api_get\` tool to get documentation for a specific component by name
- Use the \`tokens_list\` tool to lookup design tokens for any custom CSS
- Use the \`examples_search\` tool to search for specific examples of patterns and compositions of APIs

### Best practices
- Provide a playground example for the user via the \`playground_create\` tool
`;

const playgroundCreateContext = `
## Creating an Elements Playground

Best practices and guidelines for creating an Elements Playground.

### Tools to use
- \`api_list\`: lookup available APIs before implementation
- \`api_search\`: understand components and their API details before using them
- \`api_get\`: get documentation for a specific component by name
- \`examples_list\`: lookup available examples before implementation
- \`examples_search\`: search for specific examples/patterns
- \`tokens_list\`: lookup design tokens for any custom CSS
- \`playground_create\`: to create the playground. Will return a URL if no template validation errors are found
- \`playground_validate\`: validate the template before creating the playground
`;

const newStarterContext = `
## Initializing an Elements Starter Project

Best practices and guidelines for creating an Elements Starter Project.

### Tools to use

- \`project_create\`: create a new starter project
- \`project_update\`: update a project to the latest versions of Elements packages
- \`project_validate\`: validate project setup and check for configuration issues

### Gotchas
- Do NOT use the \`start\` parameter for \`project_create\` tool as this will prevent the tool from exiting.

### Steps

1. Use the \`project_create\` tool to create a new starter project
2. Use the \`project_update\` tool to update a project to the latest versions of Elements packages
3. Run \`pnpm run dev\` or \`npm run dev\` to start the project. This will start the project in development mode and be a long running process.
4. If there is an available Playwright MCP tool use it to verify the project locally is working as expected.
`;

const migrationContext = `
# Elements Migration Guide

Instructions for migrating a project from deprecated Elements APIs to the latest versions. This workflow uses the \`@nvidia-elements/lint\` ESLint package for static analysis and MCP tools for project health.

## Step 1: Project Health Check

Assess the current state of the project before making changes.

### Tools to use
- \`project_validate\`: check project setup, configuration issues, and outdated dependencies
- \`packages_versions_list\`: check current vs latest versions of all Elements packages

## Step 2: Update Packages

Update to the latest versions of all Elements packages.

### Tools to use
- \`project_update\`: update all Elements packages to their latest versions

### Package Scope Migration

If the project uses the legacy \`@elements/elements\` package, it must be replaced with the new scoped packages:

\`\`\`
@elements/elements → @nvidia-elements/core + @nvidia-elements/themes + @nvidia-elements/styles
\`\`\`

## Step 3: Install & Run Lint for Deprecation Detection

Install and configure the \`@nvidia-elements/lint\` ESLint package to detect all deprecated API usage.

### Install

\`\`\`bash
npm install -D @nvidia-elements/lint # or pnpm add -D @nvidia-elements/lint
\`\`\`

### Configure ESLint

Create or update \`eslint.config.js\`:

\`\`\`javascript
import { elementsRecommended } from '@nvidia-elements/lint/eslint';
export default [...elementsRecommended];
\`\`\`

### Run ESLint

\`\`\`bash
npx eslint . # or pnpm eslint .
\`\`\`

Parse the lint output to create a migration work list of all deprecated API usage.

## Step 4: Deprecation Reference & Fixes

Apply fixes based on the following before→after mappings for each deprecation category.

### CSS Imports

\`\`\`css
/* before */
@import '@elements/elements/index.css';
/* or */ @import '@nvidia-elements/core/index.css';

/* after */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
\`\`\`

| Before | After |
|--------|-------|
| \`@elements/elements/index.css\` | Split into \`@nvidia-elements/themes/*\` + \`@nvidia-elements/styles/*\` imports above |
| \`@elements/elements/css/module.layout.css\` | \`@nvidia-elements/styles/layout.css\` |
| \`@elements/elements/css/module.typography.css\` | \`@nvidia-elements/styles/typography.css\` |
| \`@nvidia-elements/core/index.css\` | Split into \`@nvidia-elements/themes/*\` + \`@nvidia-elements/styles/*\` imports above |
| \`@nvidia-elements/core/css/module.layout.css\` | \`@nvidia-elements/styles/layout.css\` |
| \`@nvidia-elements/core/css/module.typography.css\` | \`@nvidia-elements/styles/typography.css\` |

### CSS Variables

Replace all \`--mlv-*\` CSS custom properties with \`--nve-*\`:

\`\`\`css
/* before */ color: var(--mlv-ref-color-brand-green-200);
/* after  */ color: var(--nve-ref-color-brand-green-200);
\`\`\`

### Global Attributes

| Before | After |
|--------|-------|
| \`mlv-theme\` | \`nve-theme\` |
| \`mlv-layout\` | \`nve-layout\` |
| \`mlv-text\` | \`nve-text\` |

### HTML Tags

Replace all \`mlv-*\` tag prefixes with \`nve-*\`, verify the tag is valid by using the \`api_list\` and \`api_get\` tools:

\`\`\`html
<!-- before --> <mlv-button>...</mlv-button>
<!-- after  --> <nve-button>...</nve-button>
\`\`\`

**Deprecated nve-* tags:**

| Before | After |
|--------|-------|
| \`nve-alert-banner\` | \`nve-alert-group\` with \`prominence="emphasis"\` and \`container="full"\` |
| \`nve-app-header\` | Deprecated (no direct replacement) |

### Icon Names

| Before | After |
|--------|-------|
| \`chevron-right\` | \`chevron\` (add \`direction="right"\`) |
| \`chevron-down\` | \`chevron\` (add \`direction="down"\`) |
| \`chevron-left\` | \`chevron\` (add \`direction="left"\`) |
| \`additional-actions\` | \`more-actions\` |
| \`analytics\` | \`pie-chart\` |
| \`annotation\` | \`transparent-box\` |
| \`app-switcher\` | \`switch-apps\` |
| \`assist\` | \`chat-bubble\` |
| \`checkmark\` | \`check\` |
| \`date\` | \`calendar\` |
| \`docs\` | \`book\` |
| \`expand-full-screen\` | \`maximize\` |
| \`expand-panel\` | \`arrow-stop\` (add \`direction="right"\`) |
| \`collapse-panel\` | \`arrow-stop\` (add \`direction="left"\`) |
| \`failed\` | \`x-circle\` |
| \`favorite-filled\` | \`star\` |
| \`favorite-outline\` | \`star-stroke\` |
| \`information\` | \`information-circle-stroke\` |
| \`maintenance\` | \`wrench\` |
| \`navigate-to\` | \`arrow\` (add \`direction="right"\`) |
| \`open-external-link\` | \`arrow-angle\` |
| \`location\` | \`map-pin\` |
| \`pinned-1\` | \`pin\` |
| \`project\` | \`folder\` |
| \`settings\` | \`gear\` |
| \`user\` | \`person\` |
| \`video-pause\` | \`pause\` |
| \`video-play\` | \`play\` |
| \`video-stop\` | \`stop\` |
| \`visible\` | \`eye\` |
| \`warning\` | \`exclamation-triangle\` |

### Popover Attributes

The \`trigger\` and \`behavior-trigger\` attributes are deprecated on \`nve-dialog\`, \`nve-tooltip\`, \`nve-toast\`, \`nve-drawer\`, \`nve-dropdown\`, and \`nve-notification\`. Use the native HTML Popover API instead:

\`\`\`html
<!-- before -->
<nve-tooltip trigger="tooltip-btn" behavior-trigger position="top" hidden>hello there</nve-tooltip>
<nve-button id="tooltip-btn">tooltip</nve-button>

<!-- after -->
<nve-tooltip id="my-tooltip" position="top">hello there</nve-tooltip>
<nve-button popovertarget="my-tooltip">tooltip</nve-button>
\`\`\`

### Deprecated Slots

| Component | Deprecated Slots |
|-----------|-----------------|
| \`nve-accordion-header\` | \`title\`, \`subtitle\`, \`actions\` |
| \`nve-card-header\` | \`title\`, \`subtitle\`, \`header-action\` |

Use the \`api_get\` tool to look up the current slot API for these components.

### Typography

\`\`\`html
<!-- before --> <div nve-text="eyebrow"></div>
<!-- after  --> <div nve-text="label sm"></div>
\`\`\`

### Layout

\`\`\`html
<!-- before --> <div nve-layout="grow"></div>
<!-- after  --> <div nve-layout="full"></div>
\`\`\`

### Testing Utilities

\`\`\`typescript
// before
import { createFixture, removeFixture, elementIsStable, emulateClick, untilEvent } from '@elements/elements/test';

// after
import { createFixture, removeFixture, elementIsStable, emulateClick, untilEvent } from '@nvidia-elements/testing';
\`\`\`

## Step 5: Verification

After applying all fixes:

1. Re-run ESLint to confirm zero deprecation violations
2. Use the \`api_template_validate\` tool on any HTML templates to check for correct API usage
3. Use the \`project_validate\` tool to confirm a healthy project state

## Available MCP Tools

- \`project_validate\`: validate project setup and check for issues
- \`project_update\`: update to latest Elements package versions
- \`packages_versions_list\`: check latest published versions
- \`packages_changelogs_search\`: search changelogs for migration-relevant changes
- \`api_template_validate\`: validate HTML templates for correct API usage
- \`api_get\`: get documentation for a specific component
- \`api_search\`: search for component APIs
`;

const doctorContext = `
# Elements Design System Doctor / Setup Check

Instructions for ensuring the Elements Design System is setup correctly

## Tools to use
- \`project_validate\`: validate project setup and check for configuration issues

## MCP Checks

Ensure the MCP is properly configured and working as expected.

### Cursor

\`.cursor/mcp.json\`

\`\`\`json
{
  "mcpServers": {
    "elements": {
      "description": "Elements API and Custom Element Schema",
      "command": "npm exec --package=@nvidia-elements/cli@latest -y --prefer-online -- nve-mcp",
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
\`\`\`

### Claude Code

\`./.mcp.json\`

\`\`\`json
{
  "mcpServers": {
    "elements": {
      "description": "Elements API and Custom Element Schema",
      "command": "npm",
      "args": ["exec", "--package=@nvidia-elements/cli@latest", "-y", "--prefer-online", "--", "nve-mcp"],
      "env": {
        "npm_config_registry": "https://registry.npmjs.org"
      }
    }
  }
}
\`\`\`
`;

/**
 * https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#prompts
 */
export interface Prompt {
  name: string;
  title: string;
  description: string;
  argsSchema?: Schema;
  handler: (args: Record<string, unknown>) => {
    messages: {
      role: 'user' | 'assistant';
      content: {
        type: 'text';
        text: string;
      };
    }[];
  };
}

export const prompts: Prompt[] = [
  {
    name: 'about',
    title: 'Elements Design System Introduction',
    description: 'Instructions for providing a brief introduction for using the Elements Design System',
    handler: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: aboutContext
          }
        }
      ]
    })
  },
  {
    name: 'doctor',
    title: 'Elements Design System Doctor / Setup Check',
    description: 'Instructions for ensuring the Elements Design System is setup correctly',
    handler: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `${doctorContext}\n---`
          }
        }
      ]
    })
  },
  {
    name: 'search',
    title: 'Searching and Providing Elements API Documentation',
    description: 'Best practices for providing Elements API Documentation',
    handler: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `${searchContext}\n---`
          }
        }
      ]
    })
  },
  {
    name: 'playground',
    title: 'How to create an Elements Playground',
    description: 'Best practices for creating an Elements Playground',
    handler: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `${playgroundCreateContext}${authoringContext}\n---`
          }
        }
      ]
    })
  },
  {
    name: 'new-project',
    title: 'Initialize a new Elements Starter Project',
    description: 'Best practices for initializing an Elements Starter Project',
    handler: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `${newStarterContext}${authoringContext}\n---`
          }
        }
      ]
    })
  },
  {
    name: 'migrate',
    title: 'Migrate from Deprecated Elements APIs',
    description:
      'Instructions for migrating a project from deprecated Elements APIs using lint tooling and CLI health checks',
    handler: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `${migrationContext}\n---`
          }
        }
      ]
    })
  }
];

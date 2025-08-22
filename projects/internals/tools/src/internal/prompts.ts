import { type Schema } from './tools.js';

const authoringContext = `
### Best practices
- Prefer stateless/static HTML when possible
- Use plain HTML/CSS and JavaScript unless specifically requested (angular, react, vue, lit, etc)
- Do NOT use event handler content attributes such as \`onclick\` or \`onchange\` attributes. Use JavaScript event listeners instead.
- Avoid applying custom CSS to nve-* elements, only use them for native HTML elements
- Prefer Elements APIs over custom CSS. If CSS is required, use design tokens via the \`tokens_list\` tool.
- Verify that each Elements API usage is correct by checking the API documentation via the \`api_search\` tool

### API Gotchas
- Do not use \`nve-grid\` for general layout
- Do not use \`nve-layout\` or \`nve-text\` attributes on custom elements, only use them on native HTML elements
- Use of the \`nve-text\` attribute applies the CSS \`text-box: trim-both\`, meaning there is no surrounding whitespace for text. Layouts likely need to use \`nve-layout="gap:*"\` to add whitespace between text elements
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
1. **What is Elements?** - Explain it's NVIDIA's design system for AI/ML applications, built for speed and scale
2. **Why use Elements?** - Benefits for AI/ML teams: consistency, accessibility, performance, framework agnostic
3. **Getting Started** - Where to get started with Elements
4. **Additional Resources** - Where to find additional resources for the Elements Design System

**Do NOT create any files** Just provide the content.

**Target audience:** Developers new to Elements, especially those working on AI/ML applications who need a robust, accessible design system.

**Tone:** Professional but approachable, with clear explanations and practical guidance.

**Length:** Comprehensive but digestible - break into logical sections that can be consumed incrementally.

### Getting Started with Elements

\`\`\`bash
# local .npmrc file
registry=https://registry.npmjs.org
\`\`\`

\`\`\`bash
# https://registry.npmjs.org
npm login

# install core dependencies
npm install -g @nvidia-elements/cli

nve project.create --type=typescript # typescript, angular, react, lit, preact, solidjs, vue, nextjs, go
\`\`\`

### Resources for Users
- [Documentation](https://NVIDIA.github.io/elements/)
- [Gitlab Repo](https://github.com/NVIDIA/elements)
- [Slack Support](https://nvidia.slack.com/archives/C03BDL2UCGK)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)

### Resources for Agent - Available MCP Tools
- \`api_version\`: lookup the version of any component
- \`api_list\`: lookup available APIs before implementation
- \`changelogs_list\`: lookup changelogs for any component
- \`changelogs_search\`: search for specific changelogs

---
`;

const searchContext = `
## Searching and Providing Elements API Documentation

Explain the API in a way that is easy to understand and follow

### Tools to use
- Use the \`api_list\` tool to lookup available APIs before implementation
- Use the \`api_search\` tool to understand components and their API details before using them
- Use the \`tokens_list\` tool to lookup design tokens for any custom CSS
- Use the \`api_examples_search\` tool to search for specific examples of patterns and compositions of APIs

### Best practices
- Provide a playground example for the user via the \`playground_create\` tool

---
`;

const playgroundCreateContext = `
## Creating an Elements Playground

Best practices and guidelines for creating an Elements Playground.

### Tools to use
- \`api_list\`: lookup available APIs before implementation
- \`api_search\`: understand components and their API details before using them
- \`examples_list\`: lookup available examples before implementation
- \`examples_search\`: search for specific examples/patterns
- \`tokens_search\`: lookup design tokens for any custom CSS
- \`playground_validate\`: validate the template before creating the playground
- \`playground_create\`: create the playground, only include content that is within the body element

## Authoring Guidelines

${authoringContext}

---
`;

const newStarterContext = `
## Initializing an Elements Starter Project

Best practices and guidelines for creating an Elements Starter Project.

### Tools to use

- \`projects_create\`: create a new starter project
- \`projects_update\`: update a project to the latest versions of Elements packages
- \`projects_health\`: check the health of a project using Elements packages

### Gotchas
- Do NOT use the \`start\` parameter for \`projects_update\` tool as this will prevent the tool from exiting.

### Steps

1. Use the \`projects_create\` tool to create a new starter project
2. Use the \`projects_update\` tool to update a project to the latest versions of Elements packages
3. Run \`pnpm run dev\` or \`npm run dev\` to start the project. This will start the project in development mode and be a long running process.
4. If there is an available Playwright MCP tool use it to verify the project locally is working as expected.

${authoringContext}

---
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
      role: 'user' | 'assistant' | 'system';
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
    name: 'search',
    title: 'Searching and Providing Elements API Documentation',
    description: 'Best practices for providing Elements API Documentation',
    handler: () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `${searchContext}${playgroundCreateContext}`
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
            text: playgroundCreateContext
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
            text: newStarterContext
          }
        }
      ]
    })
  }
];

---
{
  title: 'MCP Apps',
  description: 'Use NVIDIA Elements in MCP Apps and other iframe-based MCP UI hosts with standard Web Components.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'mcp-app' %}

Elements components are standard [Web Components](docs/integrations/custom-elements/). They run anywhere the host can render HTML and load JavaScript modules. This includes browser apps, framework apps, static HTML pages, and iframe-based MCP UI surfaces.

[MCP Apps](https://apps.extensions.modelcontextprotocol.io/api/) render tool UI inside an isolated iframe. The host controls the container, fetches a `ui://` HTML resource from the MCP server, and passes tool input and results to the view through the MCP Apps message channel. Because Elements registers native custom elements such as `nve-page`, `nve-alert`, and `nve-button`, the app view does not need a React, Vue, or Svelte adapter to render.

{% installation 'mcp-app' %}

## Minimal App Shape

An MCP App using Elements has three pieces:

1. An MCP tool that declares `_meta.ui.resourceUri`.
2. A matching `ui://` HTML resource served with `text/html;profile=mcp-app`.
3. A browser view that imports Elements, connects to the host, and renders tool data.

```typescript
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const server = new McpServer({ name: 'elements-mcp-app', version: '0.0.0' });
const resourceUri = 'ui://hello/mcp-app.html';

registerAppTool(
  server,
  'hello',
  {
    title: 'Hello',
    description: 'Show an Elements MCP App.',
    inputSchema: {},
    _meta: { ui: { resourceUri } }
  },
  async () => ({
    content: [{ type: 'text', text: 'Hello from Elements.' }],
    structuredContent: { greeting: 'Hello from Elements.' }
  })
);

registerAppResource(server, 'Elements MCP App', resourceUri, { mimeType: RESOURCE_MIME_TYPE }, async () => ({
  contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: appHtml }]
}));
```

The HTML resource can use Elements exactly like any other web page:

```html
<html lang="en" nve-theme="dark">
  <body>
    <nve-page document-scroll>
      <nve-page-header slot="header">
        <nve-logo slot="prefix" size="sm" color="brand-green">NV</nve-logo>
        <h2 slot="prefix" nve-text="heading sm">MCP App</h2>
      </nve-page-header>
      <main nve-layout="column gap:lg pad:lg align:left">
        <h1 nve-text="heading xl">Hello from Elements</h1>
        <nve-alert status="success" id="greeting">Waiting for tool result.</nve-alert>
      </main>
    </nve-page>
    <script type="module" src="./mcp-app.js"></script>
  </body>
</html>
```

Register only the Elements used by the app:

```typescript
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import { App, applyDocumentTheme } from '@modelcontextprotocol/ext-apps';

const app = new App({ name: 'elements-mcp-app', version: '0.0.0' }, {});
const greeting = document.querySelector<HTMLElement>('#greeting');

app.ontoolresult = result => {
  const text = result.structuredContent?.greeting;
  if (typeof text === 'string' && greeting) greeting.textContent = text;
};

app.onhostcontextchanged = context => {
  if (context.theme) {
    applyDocumentTheme(context.theme);
    document.documentElement.setAttribute('nve-theme', context.theme);
  }
};

await app.connect();
```

## Layout And Sizing

MCP hosts own the iframe. The app should treat host dimensions as constraints, not as a canvas it can force to a fixed width.

Read `app.getHostContext().containerDimensions` after connecting. If the host provides a fixed `width`, let the app fill it. If it provides `maxWidth`, keep the layout responsive up to that maximum. The MCP Apps SDK sends size-change notifications by default, so the host can resize flexible containers as the app content changes.

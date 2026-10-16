---
{
  title: 'NVIDIA Elements CLI',
  description: 'The NVIDIA Elements CLI: scaffold projects, generate component boilerplate, and pull in starter templates from the command line.',
  layout: 'docs.11ty.js'
}
---

# Elements CLI

<h2 nve-text="heading sm muted">The Elements CLI provides command-line access to the Elements design system. Use it to scaffold new projects pre-configured with Elements, look up component APIs and design tokens, validate templates, and generate shareable playgrounds -- all without leaving your terminal</h2>

{% install-cli %}

## Usage

### Project Creation

Use the CLI to quickly bootstrap frontend UIs pre-configured with Elements.

```shell
# generate a vite/typescript project and start dev server once created
nve project.create --type=typescript --start
```

### API Search

The CLI also can provide API search results withing the terminal.

```shell
nve api.search "badge"
```

### API Validation

Check paths or glob patterns, or pass one typed document through standard input. Supplied content defaults to HTML; use `--lang json` with `--filename` for JSON.

```shell
nve api.validate 'src/**/*.html' package.json --format json
printf '%s' '<nve-button></nve-button>' | nve api.validate --stdin --format json
printf '%s' '{}' | nve api.validate --stdin --lang json --filename package.json
```

Markdown is the default format. JSON returns `ok`, complete summary counts, and diagnostics with locations, severity, rule, suggestion, and whether a fix is available. Errors produce a nonzero exit code; warnings do not. The command always uses the recommended Elements rules. Use `--max-diagnostics` to limit returned findings, and use `--fix` only with path inputs. It respects `.gitignore`, skips `node_modules`, and by default reads at most 200 files, 5 MiB total, and returns 100 diagnostics. It also refuses paths outside the current directory.

Search result output:

```html
## nve-badge

A visual indicator that communicates a status description of an associated component. Status badges use short text, color, and icons for quick recognition .

### Example

    <nve-badge>badge</nve-badge>

### Import

    import '@nvidia-elements/core/badge/define.js';

### Slots

┌─────────────┬──────────────────────────┐
│ name        │ description              │
├─────────────┼──────────────────────────┤
│             │ default slot for content │
├─────────────┼──────────────────────────┤
│ prefix-icon │ slot for prefix icon     │
├─────────────┼──────────────────────────┤
│ suffix-icon │ slot for suffix icon     │
└─────────────┴──────────────────────────┘
...
```

### Skills

Use the Elements skill to give AI agents persistent workflow context. Install its complete directory in the current project, or install it for the current user:

```shell
nve skills.install
nve skills.install --global
```

## Commands

<nve-grid>
  <nve-grid-header>
    <nve-grid-column>Command</nve-grid-column>
    <nve-grid-column>Description</nve-grid-column>
  </nve-grid-header>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve --upgrade</code></nve-grid-cell>
    <nve-grid-cell>Upgrade to the latest CLI release.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get list of all available Elements (nve-*) APIs and components.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.search &lt;query&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Search and retrieve a list of Elements (nve-*) components and APIs using keywords or natural language.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.get &lt;names..&gt; [--format &lt;format&gt;]</code></nve-grid-cell>
    <nve-grid-cell>Get documentation for one to five known components or attributes (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.validate [paths..]</code></nve-grid-cell>
    <nve-grid-cell>Check HTML and JSON files using Elements lint rules.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.imports.get &lt;template&gt;</code></nve-grid-cell>
    <nve-grid-cell>Get esm imports for a given HTML template using Elements APIs (nve-*).</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve api.tokens.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get available semantic CSS custom properties / design tokens for theming.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.list</code></nve-grid-cell>
    <nve-grid-cell>Get latest published versions of all Elements packages.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.get &lt;name&gt;</code></nve-grid-cell>
    <nve-grid-cell>Get details for a specific Elements package.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve packages.changelogs.get &lt;name&gt; [format]</code></nve-grid-cell>
    <nve-grid-cell>Retrieve changelog details by package name.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve examples.list [format]</code></nve-grid-cell>
    <nve-grid-cell>Get list of available Elements (nve-*) patterns and examples.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve skills.install [--global]</code></nve-grid-cell>
    <nve-grid-cell>Install the Elements agent skill in the project or for the current user.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve playground.validate &lt;template&gt;</code></nve-grid-cell>
    <nve-grid-cell>Validates HTML templates specifically for playground examples.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve playground.create &lt;template&gt; [type] [name] [author]</code></nve-grid-cell>
    <nve-grid-cell>Create a shareable playground URL from an HTML template.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.create &lt;type&gt; [cwd] [start]</code></nve-grid-cell>
    <nve-grid-cell>Create a new starter project.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.validate &lt;type&gt; [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Check project for configuration issues and dependencies.</nve-grid-cell>
  </nve-grid-row>
  <nve-grid-row>
    <nve-grid-cell><code nve-text="code">nve project.setup [cwd]</code></nve-grid-cell>
    <nve-grid-cell>Setup or update a project to use Elements.</nve-grid-cell>
  </nve-grid-row>
</nve-grid>

## Troubleshooting

### Public packages

The project publishes `@nvidia-elements/cli` and the other `@nvidia-elements/*` packages to the public npm registry at `https://registry.npmjs.org`. A public install uses the commands on this page, without a version pin and without `npm login` or an NVIDIA registry credential.

### 403 Forbidden

A `403 Forbidden` response can come from the registry that received the request, from a proxy, or from an authorization check. Read the registry host in the error, then compare it with the npm settings for the default registry and the `@nvidia-elements` scope:

```shell
npm config get registry
npm config get @nvidia-elements:registry
```

When the request goes to `https://registry.npmjs.org`, treat the failure as a network, proxy, or registry-policy problem. Leave `npm login` for a later step.

When the request goes to a private registry that your organization requires, refresh that registry's credentials with the login method the registry documents. Keep tokens out of shell history, examples, and logs. Internal NVIDIA teams can keep using Artifactory, which proxies the public npm registry. The [migration guide](/docs/about/migration/#1-update-registry-configuration) describes that setup.

### Unsupported Engine

An `Unsupported engine` warning means your Node.js version is out of date. The CLI requires Node.js v20 or later. Update Node.js and try again.

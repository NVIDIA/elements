import themeTokens from '@nvidia-elements/themes/index.json' with { type: 'json' };

const SITE_URL = 'https://nvidia.github.io/elements';

const CSS_COLOR_PATTERN = /^(?:#|(?:color|color-mix|hsl|hsla|lab|lch|oklab|oklch|rgb|rgba)\()/i;

const TYPOGRAPHY_TOKENS = {
  'display-xl': {
    fontFamily: 'nve-ref-font-family-inter',
    fontSize: 'nve-ref-font-size-1200',
    fontWeight: 'nve-ref-font-weight-regular',
    lineHeight: 'nve-ref-font-line-height-tight'
  },
  display: {
    fontFamily: 'nve-ref-font-family-inter',
    fontSize: 'nve-ref-font-size-1000',
    fontWeight: 'nve-ref-font-weight-regular',
    lineHeight: 'nve-ref-font-line-height-tight'
  },
  heading: {
    fontFamily: 'nve-ref-font-family-inter',
    fontSize: 'nve-ref-font-size-600',
    fontWeight: 'nve-ref-font-weight-semibold',
    lineHeight: 'nve-ref-font-line-height-snug'
  },
  body: {
    fontFamily: 'nve-ref-font-family-inter',
    fontSize: 'nve-ref-font-size-200',
    fontWeight: 'nve-ref-font-weight-regular',
    lineHeight: 'nve-ref-font-line-height-moderate'
  },
  label: {
    fontFamily: 'nve-ref-font-family-inter',
    fontSize: 'nve-ref-font-size-200',
    fontWeight: 'nve-ref-font-weight-medium',
    lineHeight: 'nve-ref-font-line-height-moderate'
  },
  code: {
    fontFamily: 'nve-ref-font-family-roboto-mono',
    fontSize: 'nve-ref-font-size-200',
    fontWeight: 'nve-ref-font-weight-regular',
    lineHeight: 'nve-ref-font-line-height-relaxed'
  }
};

const ROUNDED_TOKENS = {
  none: 'nve-ref-border-radius-none',
  xs: 'nve-ref-border-radius-xs',
  sm: 'nve-ref-border-radius-sm',
  md: 'nve-ref-border-radius-md',
  lg: 'nve-ref-border-radius-lg',
  full: 'nve-ref-border-radius-full'
};

const SPACING_TOKENS = {
  none: 'nve-ref-space-none',
  xs: 'nve-ref-space-xs',
  sm: 'nve-ref-space-sm',
  md: 'nve-ref-space-md',
  lg: 'nve-ref-space-lg',
  xl: 'nve-ref-space-xl',
  xxl: 'nve-ref-space-xxl'
};

function resolveTokenValue(tokenName, resolving = new Set()) {
  if (resolving.has(tokenName)) {
    throw new Error(`Circular NVIDIA Elements token reference: ${tokenName}`);
  }

  const value = themeTokens[tokenName];
  if (value === undefined) {
    throw new Error(`Unknown NVIDIA Elements token: ${tokenName}`);
  }

  if (themeTokens[value] !== undefined) {
    resolving.add(tokenName);
    const resolved = resolveTokenValue(value, resolving);
    resolving.delete(tokenName);
    return resolved;
  }

  const product = /^(\S+)\s+\*\s+(-?\d+(?:\.\d+)?)([a-z%]+)$/i.exec(value);
  if (product && themeTokens[product[1]] !== undefined) {
    resolving.add(tokenName);
    const scale = Number(resolveTokenValue(product[1], resolving));
    resolving.delete(tokenName);
    return `${scale * Number(product[2])}${product[3]}`;
  }

  return value;
}

function getSemanticColorTokens() {
  return Object.fromEntries(
    Object.keys(themeTokens)
      .filter(tokenName => tokenName.startsWith('nve-sys-'))
      .filter(tokenName => CSS_COLOR_PATTERN.test(String(resolveTokenValue(tokenName)).trim()))
      .sort()
      .map(tokenName => [tokenName, tokenName])
  );
}

function yamlScalar(value) {
  return typeof value === 'number' ? String(value) : JSON.stringify(value);
}

function renderSimpleTokenGroup(name, mapping) {
  return [
    `${name}:`,
    ...Object.entries(mapping).map(([tokenName, sourceToken]) => {
      return `  ${tokenName}: ${yamlScalar(resolveTokenValue(sourceToken))}`;
    })
  ].join('\n');
}

function renderTypography() {
  const lines = ['typography:'];
  for (const [tokenName, properties] of Object.entries(TYPOGRAPHY_TOKENS)) {
    lines.push(`  ${tokenName}:`);
    for (const [propertyName, sourceToken] of Object.entries(properties)) {
      const value = resolveTokenValue(sourceToken);
      lines.push(`    ${propertyName}: ${yamlScalar(propertyName === 'fontWeight' ? Number(value) : value)}`);
    }
  }
  return lines.join('\n');
}

export function createDesignMdContent() {
  const frontMatter = [
    '---',
    'version: "alpha"',
    'name: "NVIDIA Elements"',
    'description: "The official design language and UI agent contract for NVIDIA Elements interfaces."',
    renderSimpleTokenGroup('colors', getSemanticColorTokens()),
    renderTypography(),
    renderSimpleTokenGroup('rounded', ROUNDED_TOKENS),
    renderSimpleTokenGroup('spacing', SPACING_TOKENS),
    '---'
  ].join('\n');

  return `${frontMatter}

## Overview

NVIDIA Elements is the design system and framework-agnostic Web Component system for operational interfaces across AI/ML infrastructure, robotics, and autonomous vehicle tooling.

This is the official DESIGN.md for NVIDIA Elements. It describes the Elements product UI system, not the visual identity of every NVIDIA website or product. Use the exact \`nve-*\` component APIs, semantic CSS custom properties, examples, and accessibility behavior documented at [${SITE_URL}/](${SITE_URL}/).

Build with Elements before creating custom UI. Install \`@nvidia-elements/themes\`, \`@nvidia-elements/styles\`, \`@nvidia-elements/core\`, \`@nvidia-elements/cli\` and the required component packages, or run \`nve project.setup\` to configure an existing project. Agents can query component APIs, examples, tokens, icons, and project validation through the [Elements CLI](${SITE_URL}/docs/cli/) and [MCP server](${SITE_URL}/docs/mcp/).

## Colors

The front matter exposes the complete light-theme baseline for shipped \`nve-sys-*\` color tokens. Each key uses the canonical Elements token name. In application CSS, prefix that key with \`--\`: for example, \`{colors.nve-sys-layer-canvas-background}\` corresponds to \`--nve-sys-layer-canvas-background\`. Use the custom property instead of copying its resolved front matter value so light, dark, high-contrast, and user-defined themes continue to work.

- \`nve-sys-accent-*\` identifies primary, secondary, and tertiary accents.
- \`nve-sys-layer-*\` pairs canvas, shell, container, overlay, and popover backgrounds with their content colors.
- \`nve-sys-text-*\` provides default, muted, emphasis, placeholder, and link roles.
- \`nve-sys-interaction-*\` describes control surfaces and their emphasis, destructive, disabled, hover, selected, highlighted, and field states.
- \`nve-sys-support-*\` and \`nve-sys-status-*\` communicate semantic and operational states. Never rely on color alone; pair status color with text and an icon when appropriate.
- \`nve-sys-visualization-*\` provides categorical, sequential, diverging, and trend colors for data graphics.
- \`nve-sys-contrast-*\` and \`nve-sys-scrollbar-*\` support contrast composition and native scroll bar styling.

Use the [design token reference](${SITE_URL}/docs/foundations/themes/tokens/) for the complete token inventory and current CSS custom-property names.

## Typography

Inter is the primary interface typeface. Reserve \`Roboto Mono\` for code, identifiers, logs, metrics, and other content where character distinction matters. The compact scale helps operational applications present dense information without sacrificing legibility.

- Use \`{typography.display}\` sparingly for page-level moments.
- Use \`{typography.heading}\` to organize content; do not choose heading markup for visual size alone.
- Use \`{typography.body}\` for most interface copy. Apply documented \`nve-text\` size variants when copy needs more emphasis.
- Use \`{typography.label}\` for controls, metadata, and compact navigation.
- Use \`{typography.code}\` for source code and machine-oriented values.

Apply the \`nve-text\` utilities documented in the [typography foundation](${SITE_URL}/docs/foundations/typography/) while preserving semantic HTML headings, labels, lists, and paragraphs.

## Layout

Prefer the \`nve-layout\` attribute utilities on semantic native elements.

- Use \`row\` for toolbars, action groups, and horizontal navigation.
- Use \`column\` for forms, panels, page sections, and reading order.
- Use \`grid\` for dashboards, galleries, and responsive multi-column content.
- Start with a single-column small-screen layout, then add container or viewport adaptations.
- Keep the DOM order meaningful. Visual reordering must not break reading or keyboard order.

See the [layout foundation](${SITE_URL}/docs/foundations/layout/) for supported gap, padding, alignment, grid, and responsive patterns.

## Elevation & Depth

Layer roles communicate depth. Canvas holds the application background, containers group durable content, overlays sit above containers, and popovers represent temporary top-layer UI. Prefer layer backgrounds, borders, and restrained shadows over ornamental effects.

Use elevation only when it explains containment or interaction. Dialogs, menus, tooltips, and transient panels must use the native top-layer patterns documented by Elements. Avoid decorative glass effects, large ambient shadows, and gradients that reduce text or status contrast.

## Shapes

The radius scale ranges from square \`{rounded.none}\` surfaces through \`{rounded.lg}\` containers. Standard controls use \`{rounded.sm}\`; cards and panels commonly use \`{rounded.md}\`. Reserve \`{rounded.full}\` for badges, tags, avatars, and other intentionally pill-shaped or circular objects.

Do not introduce arbitrary radii when an Elements radius token fits. Consistent geometry helps dense application surfaces read as one system.

## Components

Use existing \`nve-*\` Custom Elements and their documented composition patterns before creating replacements. The component tokens in the front matter summarize common visual roles; the live API documentation remains normative for properties, events, slots, CSS parts, accessibility, and behavior.

- All APIs available as [llms.txt](https://nvidia.github.io/elements/llms.txt)
- Use [nve-button](${SITE_URL}/docs/elements/button/) and [nve-icon-button](${SITE_URL}/docs/elements/icon-button/) for actions.
- Use [nve-input](${SITE_URL}/docs/elements/input/), [nve-select](${SITE_URL}/docs/elements/select/), and the form guidance for data entry.
- Use [nve-card](${SITE_URL}/docs/elements/card/) and [nve-page](${SITE_URL}/docs/elements/page/) for durable content structure.
- Use [nve-alert](${SITE_URL}/docs/elements/alert/), badges, and notifications for status communication.
- Use [nve-dialog](${SITE_URL}/docs/elements/dialog/), dropdowns, tooltips, and toggletips for temporary top-layer interaction.
- Use the [data grid](${SITE_URL}/docs/elements/data-grid/) for interactive tabular data rather than recreating sorting, selection, pagination, or keyboard navigation.

Import component \`define.js\` entrypoints explicitly unless the project intentionally uses a bundle. Compose through public slots and attributes; do not reach into component shadow roots or depend on undocumented internals.

## Do and Don't

**Do**

- Start from Elements components, semantic tokens, examples, and patterns.
- Preserve semantic HTML, keyboard access, focus visibility, labels, and accessible names.
- Use semantic \`--nve-sys-*\` tokens in application CSS so themes continue to work.
- Keep operational content concise, scannable, and explicit about state.
- Check generated UI with the Elements lint tooling and relevant accessibility tests.
- Query the CLI or MCP server when an API, icon name, token, or example is uncertain.

**Don't**

- Recreate an Elements component with generic HTML when the maintained component already fits.
- Hard-code resolved colors, spacing, or typography values in production application CSS.
- Encode meaning through color, position, animation, or iconography alone.
- Add gradients, glass effects, oversized radii, or decorative shadows without a product need.
- Invent component properties, slots, events, CSS parts, token names, or icon names.
`;
}

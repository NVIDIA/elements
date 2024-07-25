import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import tokenJSON from '@nvidia-elements/themes/index.json';
import tokenJSONDark from '@nvidia-elements/themes/dark.json';
import tokenJSONHighContrast from '@nvidia-elements/themes/high-contrast.json';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/toast/define.js';

export default {
  title: 'Foundations/Themes/Examples'
};

export const All = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context))}`
};

export const Size = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-size')))}`
};

export const Space = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-space')))}`
};

export const Color = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-color')))}`
};

export const BorderColor = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-border-color')))}`
};

export const BorderWidth = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-border-width')))}`
};

export const BorderRadius = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-border')))}`
};

export const Opacity = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-opacity')))}`
};

export const Shadow = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-shadow')))}`
};

export const Text = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-font') || value.includes('sys-text')))}`
};

export const Status = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-status') && !['neutral', 'danger', 'success', 'warning', 'accent'].find(i => value.includes(i))))}`
};

export const Support = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-support')))}`
};

export const Accent = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-accent')))}`
};

export const Animation = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('ref-animation')))}`
};

export const Interaction = {
  render: (_, context) => html`
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.endsWith('sys-interaction-background') || value.endsWith('sys-interaction-color')))}
  <h3 class="sbdocs-h2">Emphasis</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-interaction-emphasis')))}
  <h3 class="sbdocs-h2">Destructive</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-interaction-destructive')))}
  <h3 class="sbdocs-h2">Highlighted</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-interaction-highlighted')))}
  <h3 class="sbdocs-h2">Selected</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-interaction-selected')))}
  <h3 class="sbdocs-h2">Disabled</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-interaction-disabled')))}
  <h3 class="sbdocs-h2">Field</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-interaction-field')))}
  `
};

export const Layer = {
  render: (_, context) => html`
  <h3 class="sbdocs-h2">Canvas</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-layer-canvas')))}
  <h3 class="sbdocs-h2">Shell</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-layer-shell')))}
  <h3 class="sbdocs-h2">Container</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-layer-container')))}
  <h3 class="sbdocs-h2">Overlay</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-layer-overlay')))}
  <h3 class="sbdocs-h2">Popover</h3>
  ${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-layer-popover')))}
  `
};

export const VisualizationCategorical = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-visualization-categorical')))}`
};

export const VisualizationSequentialDivergingVirdis = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-visualization-sequential-diverging-virdis')))}`
};

export const VisualizationSequentialDivergingRedGreen = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-visualization-sequential-diverging-red-green')))}`
};

export const VisualizationTrend = {
  render: (_, context) => html`${renderTokenTable(getFormattedTokens(tokenJSON, context, value => value.includes('sys-visualization-trend')))}`
};

export const ContrastInvert = {
  render: (_, context) => {
    const tokens = Object.keys(getFormattedTokens(tokenJSON, context, value => value.includes('ref-color-green-grass'))).map(k => html`<div style="width: 50px; height: 50px; background: var(${k})"></div>`);
    return html`
    <div nve-layout="column gap:sm">
      <div nve-layout="row gap:md align:vertical-center"><p nve-text="label emphasis bold">light</p><div mlv-theme="root light" nve-layout="row">${tokens}</div></div>
      <div nve-layout="row gap:md align:vertical-center"><p nve-text="label emphasis bold">dark</p><div mlv-theme="root dark" nve-layout="row">${tokens}</div></div>
    </div>
    `
  }
};

export const ColorPalette = {
  render: () => {
    return html`
      <style>
        .color-scale {
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)) !important;
        }

        .color-scale button {
          border: 0;
          padding: 12px;
          width: 100%;
          height: 40px;
          cursor: pointer;
          transition: scale 100ms linear
        }

        .color-scale button:hover {
          scale: 1.1;
        }
      </style>
      <div nve-layout="grid gap:md" class="color-scale full-width">
      ${getColorScale('ref-color-gray-slate')}
      ${getColorScale('ref-color-gray-denim')}
      ${getColorScale('ref-color-green-grass')}
      ${getColorScale('ref-color-green-jade')}
      ${getColorScale('ref-color-green-mint')}
      ${getColorScale('ref-color-teal-seafoam')}
      ${getColorScale('ref-color-teal-cyan')}
      ${getColorScale('ref-color-blue-sky')}
      ${getColorScale('ref-color-blue-cobalt')}
      ${getColorScale('ref-color-blue-indigo')}
      ${getColorScale('ref-color-purple-violet')}
      ${getColorScale('ref-color-purple-lavender')}
      ${getColorScale('ref-color-purple-plum')}
      ${getColorScale('ref-color-pink-rose')}
      ${getColorScale('ref-color-pink-magenta')}
      ${getColorScale('ref-color-red-cardinal')}
      ${getColorScale('ref-color-red-tomato')}
      ${getColorScale('ref-color-orange-pumpkin')}
      ${getColorScale('ref-color-yellow-amber')}
      ${getColorScale('ref-color-yellow-nova')}
      ${getColorScale('ref-color-lime-pear')}
      ${getColorScale('ref-color-brand-green')}
      </div>
      <mlv-toast id="color-scale-toast" trigger="color-scale" close-timeout="1500" position="left" hidden>copied!</mlv-toast>
      <script type="module">
        const toast = document.querySelector('#color-scale-toast');
        const scale = document.querySelector('.color-scale');
        toast.addEventListener('close', () => toast.hidden = true);
        scale.addEventListener('click', e => {
          if (e.target.tagName === 'BUTTON') {
            navigator.clipboard.writeText(e.target.value);
            toast.anchor = e.target.id;
            toast.hidden = false;
          }
        });
      </script>
    `;
  }
};

function getColorScale(color) {
  const tokens: any[] = [];
  for (let i = 1; i < 13; i++) {
    tokens.push(html`<button id="--mlv-${color}-${i}00" value="--mlv-${color}-${i}00" style="background: var(--mlv-${color}-${i}00); color: var(${i < 9 ? '--mlv-ref-color-gray-slate-1200' : '--mlv-ref-color-gray-slate-100'})"></button>`)
  }
  return html`
  <div nve-layout="column pad-bottom:xl">
    <h2 nve-text="body">${color.replace('ref-color-', '')}</h2>
    <div nve-layout="row" style="width: 100%">
      <div nve-layout="column" style="padding-top: 25px">${Array.from(Array(12).keys()).map(i => html`<p nve-text="body" nve-layout="column align:center pad:xs" style="height: 40px">${i + 1}00</p>`)}</div>
      <div nve-layout="column" style="width: 100%"><p nve-text="body center" nve-layout="column align:center pad:xs" style="width: 100%">light</p><div mlv-theme="root light" style="width: 100%">${tokens}</div></div>
      <div nve-layout="column" style="width: 100%"><p nve-text="body center" nve-layout="column align:center pad:xs" style="width: 100%">dark</p><div mlv-theme="root dark" style="width: 100%">${tokens}</div></div>
    </div>
  </div>`;
}

function getFormattedTokens(tokens, context: any, filter?: (toke: string) => boolean) {
  return Object.entries(tokens)
    .filter(([name]) => filter ? filter(name) : true)
    .map(([name]) => ({ prop: `--${name.replace('nve', context.globals.scope)}`, value: getTokenValue(name, tokenJSON[name], context.globals.scope) }))
    .reduce((prev, next) => ({ ...prev, [next.prop]: next.value }), { });
}

function renderTokenTable(tokens) {
  return html`
  <style>
    .tokens-table {
      width: 100%;
      text-align: left;
      background: var(--nve-sys-layer-canvas-background);
    }

    .tokens-table th {
      font-weight: 400;
    }

    .tokens-table td {
      padding-bottom: var(--nve-ref-space-xxs);
    }

    .tokens-table td div {
      background: var(--nve-ref-border-color);
      min-height: var(--nve-ref-size-1000);
      display: flex;
      align-items: center;
      width: 100%;
    }

    .tokens-table td:last-child,
    .tokens-table td:nth-child(2) {
      min-width: 190px;
    }
  </style>
  <table class="tokens-table">
    <thead>
      <tr>
        <th>Token</th>
        <th>Value</th>
        <th>Demo</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(tokens).map(([name, value]: any) => {
        function _toggleCopyIcon(e: any, show: boolean) {
          e.target.querySelector('nve-icon-button').style.opacity = show ? 100 : 0;
        }

        function copyTokenName(name: string) {
          navigator.clipboard.writeText(name);
        }

        return html`<tr @mouseenter="${(e) => _toggleCopyIcon(e, true)}" @mouseleave="${(e) => _toggleCopyIcon(e, false)}">
        <td>
          ${name}
          <nve-icon-button style="opacity: 0; margin-top: -18px" title="Copy '${name}' to clipboard" icon-name="copy" container="flat" @click="${() => copyTokenName(name)}"></nve-icon-button>
        </td>
        <td>
          <code style="user-select: none">${value}</code>
        </td>
        <td>
          ${name.includes('ref-size') || name.includes('ref-space') ? html`<div style="${styleMap({ width: `var(${name})` })}"></div>` : ''}
          ${name.includes('ref-color') || name.includes('sys-visualization') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('ref-font-family') ? html`<div style="${styleMap({ 'font-family': `var(${name})`, background: 'transparent' })}">font</div>` : ''}
          ${name.includes('ref-font-weight') ? html`<div style="${styleMap({ 'font-weight': `var(${name})`, background: 'transparent' })}">weight</div>` : ''}
          ${name.includes('ref-font-line-height') ? html`<div style="${styleMap({ 'font-line-height': `var(${name})`, background: 'transparent' })}">line-height</div>` : ''}
          ${name.includes('ref-font-size') ? html`<div style="${styleMap({ 'font-size': `var(${name})`, background: 'transparent' })}">size</div>` : ''}
          ${name.includes('ref-border-radius') ? html`<div style="${styleMap({ 'border-radius': `var(${name})`, width: '100px', height: '100px' })}"></div>` : ''}
          ${name.includes('ref-border-color') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('ref-border-width') ? html`<div style="${styleMap({ border: '1px solid var(--mlv-ref-border-color)', background: 'transparent', 'border-width': value })}"></div>` : ''}
          ${name.includes('ref-opacity') ? html`<div style="${styleMap({ opacity: `var(${name})`, background: '#000' })}"></div>` : ''}
          ${name.includes('ref-shadow') ? html`<div style="padding: 12px; background: transparent;"><div style="${styleMap({ 'box-shadow': `var(${name})`, background: 'var(--mlv-sys-layer-container-background)' })}"></div></div>` : ''}
          ${name.includes('ref-animation') ? html`<div style="${styleMap({ background: 'transparent' })}"></div>` : ''}
          ${name.includes('sys-status') || name.includes('sys-support') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('sys-text') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('sys-accent') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('sys-interaction') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('sys-layer') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
        </td>
      </tr>`})}
    </tbody>
  </table>`;
}

function getTokenValue(name: string, value: string, scope) {
  const themeAttr =  document.querySelector('[nve-theme]')?.getAttribute('nve-theme');
  if (tokenJSON[name].includes('nve-')) {
    let tokens = tokenJSON;
    if (themeAttr?.includes('dark')) {
      tokens = { ...tokenJSON, ...tokenJSONDark };
    } else if (themeAttr?.includes('high-contrast')) {
      tokens = { ...tokenJSON, ...tokenJSONHighContrast };
    }

    return tokens[name].replace('nve-', `--${scope}-`);
  } else if (value.startsWith('#') && value.length === 7) {
    const [h, s, l] = hexToHSL(getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim());
    return `hsl(${h} ${s}% ${l}%)`;
  } else {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  }
}

function hexToHSL(hex: string) {
  let r: any = 0;
  let g: any = 0;
  let b: any = 0;

  if (hex.length === 4) {
    r = '0x' + hex[1] + hex[1];
    g = '0x' + hex[2] + hex[2];
    b = '0x' + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = '0x' + hex[1] + hex[2];
    g = '0x' + hex[3] + hex[4];
    b = '0x' + hex[5] + hex[6];
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;

  let h = 0;
  let s = 0;
  let l = 0;

  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);

  if (h < 0) {
    h += 360;
  }

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h.toFixed(0), s.toFixed(0), l.toFixed(0)];
}

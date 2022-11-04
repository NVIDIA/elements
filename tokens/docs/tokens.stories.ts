import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import tokenJSON from '@elements/elements/tokens/tokens.json';

export default {
  title: 'Foundations/Tokens/Examples'
};

export const Default = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON))}`
};

export const Size = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-size']))}`
};

export const Space = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-space']))}`
};

export const Color = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-color']))}`
};

export const BorderColor = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-border-color']))}`
};

export const BorderWidth = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-border-width']))}`
};

export const BorderRadius = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-border-radius']))}`
};

export const Opacity = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-opacity']))}`
};

export const Shadow = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-shadow']))}`
};

export const Text = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['ref-font', 'sys-text']))}`
};

export const Status = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['sys-status']))}`
};

export const Accent = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['sys-accent']))}`
};

export const Interaction = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['sys-interaction']))}`
};

export const Layer = {
  render: () => html`${renderTokenTable(getFormattedTokens(tokenJSON, ['sys-layer']))}`
};

function getFormattedTokens(tokens, filter?: string[]) {
  return Object.entries(tokens)
    .filter(([name]) => filter?.length ? filter.some(v => name.includes(v)) : true)
    .map(([name]) => ({ prop: `--${name}`, value: getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() }))
    .reduce((prev, next) => ({ ...prev, [next.prop]: next.value }), { });
}

function renderTokenTable(tokens) {
  return html`
  <style>
    .tokens-table {
      width: 100%;
      max-width: 1024px;
      text-align: left;
      padding: 12px;
      background: var(--mlv-sys-layer-canvas-background);
    }

    .tokens-table td {
      padding: 12px;
    }

    .tokens-table td div {
      background: var(--mlv-ref-border-color-default);
      width: 200px;
      height: 50px;
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
          e.target.querySelector('mlv-icon-button').style.opacity = show ? 100 : 0;
        }

        function copyTokenName(name: string) {
          navigator.clipboard.writeText(name);
        }

        return html`<tr @mouseenter="${(e) => _toggleCopyIcon(e, true)}" @mouseleave="${(e) => _toggleCopyIcon(e, false)}">
        <td>
          ${name}
          <mlv-icon-button style="opacity: 0" title="Copy '${name}' to clipboard" icon-name="copy" interaction="ghost" @click="${() => copyTokenName(name)}"></mlv-icon-button>
        </td>
        <td>
          <code>${value}</code>
        </td>
        <td>
          ${name.includes('ref-size') || name.includes('ref-space') ? html`<div style="${styleMap({ width: `var(${name})` })}"></div>` : ''}
          ${name.includes('ref-color') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('ref-font-family') ? html`<div style="${styleMap({ 'font-family': `var(${name})`, background: 'transparent' })}">font</div>` : ''}
          ${name.includes('ref-font-weight') ? html`<div style="${styleMap({ 'font-weight': `var(${name})`, background: 'transparent' })}">weight</div>` : ''}
          ${name.includes('ref-font-size') ? html`<div style="${styleMap({ 'font-size': `var(${name})`, background: 'transparent' })}">size</div>` : ''}
          ${name.includes('ref-border-radius') ? html`<div style="${styleMap({ 'border-radius': `var(${name})`, width: '100px', height: '100px' })}"></div>` : ''}
          ${name.includes('ref-border-color') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('ref-border-width') ? html`<div style="${styleMap({ border: '1px solid var(--mlv-ref-border-color-default)', background: 'transparent', 'border-width': value })}"></div>` : ''}
          ${name.includes('ref-opacity') ? html`<div style="${styleMap({ opacity: `var(${name})`, background: '#000' })}"></div>` : ''}
          ${name.includes('ref-shadow') ? html`<div style="${styleMap({ 'box-shadow': `var(${name})`, background: 'var(--mlv-sys-layer-container-background)', width: '200px', height: '200px' })}"></div>` : ''}
          ${name.includes('sys-status') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('sys-text') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('sys-accent') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('sys-interaction') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
          ${name.includes('sys-layer') ? html`<div style="${styleMap({ background: `var(${name})` })}"></div>` : ''}
        </td>
      </tr>`})}
    </tbody>
  </table>`;
}
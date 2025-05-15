import { html } from 'lit';
import '@nvidia-elements/code/codeblock/languages/typescript.js'
import '@nvidia-elements/code/codeblock/define.js';
import '@nvidia-elements/core/icon-button/define.js';

export default {
  title: 'Labs/Code/Codeblock',
  component: 'nve-codeblock'
};

export const Default = {
  render: () => html`
<nve-codeblock language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
`
};

export const Flat = {
  render: () => html`
<nve-codeblock container="flat" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
`
};

export const Theme = {
  render: () => html`
<nve-codeblock nve-theme="light" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
<br />
<nve-codeblock nve-theme="dark" language="typescript">
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
`
};

export const Copy = {
  render: () => html`
<nve-codeblock language="typescript">
  <nve-icon-button slot="actions" icon-name="copy" container="flat"></nve-icon-button>
  function getTime(): number {
    return new Date().getTime();
  }
</nve-codeblock>
`
};

export const Code = {
  render: () => html`
<nve-codeblock language="typescript" code="console.log('hello, world!')"></nve-codeblock>
`
};

export const LineNumbers = {
  render: () => html`
<nve-codeblock language="typescript" line-numbers>
function getTime(): number {
  return new Date().getTime();
}
</nve-codeblock>
`
}

export const Highlight = {
  render: () => html`
<nve-codeblock language="typescript" line-numbers highlight="2">
function getTime(): number {
  return new Date().getTime();
}
</nve-codeblock>
`
}

export const Overflow = {
  render: () => html`
<nve-codeblock language="typescript" line-numbers highlight="2" style="height: 100px;">
  import{LitElement as t,html as e}from"lit";import{property as s}from"lit/decorators/property.js";import{state as o}from"lit/decorators/state.js";
  import{unsafeHTML as i}from"lit/directives/unsafe-html.js";
  import{useStyles as r,shiftLeft as n}from"@nvidia-elements/core/internal";
  import l from"./codeblock.css.js";
  import a from"highlight.js/lib/core";
  import h from"highlight.js/lib/languages/shell";
</nve-codeblock>
`
};
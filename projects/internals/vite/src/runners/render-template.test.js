import assert from 'node:assert/strict';
import { test } from 'node:test';
import { html, nothing, LitElement } from 'lit';
import { serializeRenderContent } from '../template.js';

test('serializes nested markup, escaped text, attributes, and boolean bindings without hydration markers', async () => {
  const content = html`<section aria-label=${'a "quoted" label'}>
    ${[1, 2].map(value => html`<input value=${value} ?disabled=${value === 2} />`)}
    <p>${'<b>text</b>'}${nothing}</p><!--keep this comment-->
    <script type="module">globalThis.fixtureText = '<!--lit-part preserve-script-text-->'; globalThis.literal = '__nve_render_binding__';</script>
  </section>`;
  const result = await serializeRenderContent(content);
  assert.match(result, /aria-label="a &quot;quoted&quot; label"/);
  assert.match(result, /value="1"/);
  assert.match(result, /value="2"\s+disabled/);
  assert.match(result, /&lt;b&gt;text&lt;\/b&gt;/);
  assert.match(result, /<!--keep this comment-->/);
  assert.match(result, /'<!--lit-part preserve-script-text-->'/);
  assert.doesNotMatch(result.replace('<!--lit-part preserve-script-text-->', ''), /<!--\/?lit-part/);
  assert.doesNotMatch(result, /<!--lit-node/);
});

test('keeps string fixtures unchanged and rejects unsupported content', async () => {
  const content = '<div>&amp;<!--existing--></div>';
  assert.equal(await serializeRenderContent(content), content);
  await assert.rejects(serializeRenderContent({}), /string or Lit html template/);
});

test('does not construct registered custom elements while serializing markup', async () => {
  class Fixture extends LitElement {
    constructor() {
      super();
      throw new Error('Fixture components must initialize in Chromium');
    }
  }
  customElements.define('render-fixture-node-guard', Fixture);
  const result = await serializeRenderContent(
    html`<render-fixture-node-guard label=${'ready'}></render-fixture-node-guard>`
  );
  assert.match(result, /label="ready"/);
  assert.doesNotMatch(result, /shadowroot|defer-hydration/);
});

test('rejects Node event/property and script bindings rather than silently losing browser behavior', async () => {
  for (const content of [
    html`<button @click=${() => {}}>Action</button>`,
    html`<nve-fixture .data=${{ value: 1 }}></nve-fixture>`,
    html`<div>${[html`<input .value=${'test'} />`]}</div>`
  ])
    await assert.rejects(serializeRenderContent(content), /binding cannot run in the browser/);
  await assert.rejects(
    serializeRenderContent(html`<script type="module">const count = ${2};</script>`),
    /script bindings/
  );
});

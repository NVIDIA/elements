import { html } from 'lit';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/resize-handle/define.js';

export default {
  title: 'Elements/Resize Handle',
  component: 'nve-resize-handle',
};

export const Default = {
  render: () => html`
<nve-resize-handle></nve-resize-handle>`
};

export const Vertical = {
  render: () => html`
<div style="height: 200px;">
  <nve-resize-handle orientation="vertical"></nve-resize-handle>
</div>
`
};

export const SplitHorizontal = {
  render: () => html`
<section id="split-horizontal-demo" style="display: grid; width: 250px; height: 250px; grid-template-rows: 1fr auto 1fr; border: 1px solid var(--nve-ref-border-color)">
  <div style="background: hsla(0, 0%, 65%, 0.1)"></div>
  <nve-resize-handle min="20" max="230" value="125" step="20"></nve-resize-handle>
  <div></div>
</section>
<script type="module">
  const handle = document.querySelector('#split-horizontal-demo nve-resize-handle');
  const split = document.querySelector('#split-horizontal-demo');
  handle.addEventListener('input', e => split.style.gridTemplateRows = '1fr auto ' + e.target.value + 'px');
</script>
`
};

export const SplitVertical = {
  render: () => html`
<section id="split-vertical-demo" style="display: grid; width: 250px; height: 250px; grid-template-columns: 1fr auto 1fr; border: 1px solid var(--nve-ref-border-color)">
  <div style="background: hsla(0, 0%, 65%, 0.1"></div>
  <nve-resize-handle orientation="vertical" min="20" max="230" value="125" step="20"></nve-resize-handle>
  <div></div>
</section>
<script type="module">
  const handle = document.querySelector('#split-vertical-demo nve-resize-handle');
  const split = document.querySelector('#split-vertical-demo');
  handle.addEventListener('input', e => split.style.gridTemplateColumns = e.target.value + 'px auto 1fr');
</script>
`
};

export const Form = {
  render: () => html`
<form id="form-demo" nve-layout="column gap:lg">
  <section style="display: grid; width: 250px; height: 250px; grid-template-rows: 1fr auto 1fr; border: 1px solid var(--nve-ref-border-color)">
    <div></div>
    <nve-resize-handle name="resize" min="20" max="230" value="125" step="20"></nve-resize-handle>
    <div style="background: hsla(0, 0%, 65%, 0.1)"></div>
  </section>
  <nve-button>submit</nve-button>
</form>
<script type="module">
  const form = document.querySelector('#form-demo');
  const split = document.querySelector('#form-demo section');
  const handle = document.querySelector('#form-demo nve-resize-handle');

  form.addEventListener('submit', e => {
    e.preventDefault();
    console.log(Object.fromEntries(new FormData(form)));
    console.log(handle.form)
  });

  handle.addEventListener('change', e => {
    console.log('change', e.target.value);
  });

  handle.addEventListener('input', e => {
    console.log('input', e.target.value);
    split.style.gridTemplateRows = '1fr auto ' + e.target.value + 'px';
  });
</script>
`
};

export const PreventDefault = {
  render: () => html`
<form id="prevent-default-demo" nve-layout="column gap:lg">
  <section style="display: grid; width: 250px; height: 250px; grid-template-rows: 1fr auto 1fr; border: 1px solid var(--nve-ref-border-color)">
    <div></div>
    <nve-resize-handle name="resize" min="20" max="230" value="125" step="20"></nve-resize-handle>
    <div style="background: hsla(0, 0%, 65%, 0.1)"></div>
  </section>
</form>
<script type="module">
  const split = document.querySelector('#prevent-default-demo section');
  const handle = document.querySelector('#prevent-default-demo nve-resize-handle');

  handle.addEventListener('toggle', e => {
    e.preventDefault();
    console.log('toggle defaultPrevented:', e.defaultPrevented);
  });

  handle.addEventListener('input', e => {
    split.style.gridTemplateRows = '1fr auto ' + e.target.value + 'px';
  });
</script>
`
};

export const LineWidth = {
  render: () => html`
<div style="height: 200px;">
  <nve-resize-handle orientation="vertical" style="--line-width: 6px"></nve-resize-handle>
</div>
`
};

export const data = {
  title: 'Color Palette',
  layout: 'docs.11ty.js',
  permalink: 'docs/foundations/themes/color/index.html'
};

export function render(data) {
  return this.renderTemplate(
    /* html */ `
# ${data.title}

Colors should be used via the system tokens (--nve-sys-*) when possible to ensure the appropriate value is used in a semantic and meaningful way.

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

  .color-scale [colors] {
    --checker-color-1: white;
    --checker-color-2: black;
    --checker-size: 20px;
    --checker-gradient: linear-gradient(45deg, var(--checker-color-1) 25%, transparent 25%, transparent 75%, var(--checker-color-1) 75%);

    background-color: var(--checker-color-2) !important;
    background-image: var(--checker-gradient), var(--checker-gradient) !important;
    background-position: 0 0, var(--checker-size) var(--checker-size) !important;
    background-size: calc(var(--checker-size) * 2) calc(var(--checker-size) * 2) !important;
  }
</style>
<div nve-layout="grid gap:md" class="color-scale full-width">
${getColorScale('ref-color-neutral')}
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
${getColorScale('ref-color-alpha-black')}
${getColorScale('ref-color-alpha-white')}
</div>
<nve-toast id="color-scale-toast" trigger="color-scale" close-timeout="1500" position="left" hidden>copied!</nve-toast>
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
`,
    'md'
  );
}

function getColorScale(color) {
  const tokens = [];
  for (let i = 1; i < 13; i++) {
    tokens.push(
      /* html */ `<button id="--nve-${color}-${i}00" value="--nve-${color}-${i}00" style="background: var(--nve-${color}-${i}00); color: var(${i < 9 ? '--nve-ref-color-gray-slate-1200' : '--nve-ref-color-gray-slate-100'})"></button>`
    );
  }
  return /* html */ `
  <div nve-layout="column pad-bottom:xl" docs-full-width>
    <h2 nve-text="body">${color.replace('ref-color-', '')}</h2>
    <div nve-layout="row" style="width: 100%">
      <div nve-layout="column" style="padding-top: 25px">${Array.from(Array(12).keys())
        .map(
          i =>
            /* html */ `<p nve-text="body" nve-layout="column align:center pad:xs" style="height: 40px">${i + 1}00</p>`
        )
        .join('')}</div>
      <div nve-layout="column" style="width: 100%"><p nve-text="body center" nve-layout="column align:center pad:xs" style="width: 100%">light</p><div nve-theme="root light" style="width: 100%" colors="">${tokens.join('')}</div></div>
      <div nve-layout="column" style="width: 100%"><p nve-text="body center" nve-layout="column align:center pad:xs" style="width: 100%">dark</p><div nve-theme="root dark" style="width: 100%" colors="">${tokens.join('')}</div></div>
    </div>
  </div>`;
}

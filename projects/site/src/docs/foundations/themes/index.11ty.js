export const data = {
  title: 'Themes',
  layout: 'docs.11ty.js',
  permalink: 'docs/foundations/themes/index.html'
};

export function render(data) {
  return this.renderTemplate(
    /* html */ `
# ${data.title}

Themes are built leveraging CSS Custom Properties. Themes are applied by setting the \`nve-theme\` attribute on the host \`html\` element.
Themes can be independently loaded as needed to reduce the size of the initial bundle.

\`\`\`css
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/themes/high-contrast.css';
@import '@nvidia-elements/themes/reduced-motion.css';
@import '@nvidia-elements/themes/compact.css';
@import '@nvidia-elements/themes/debug.css';
\`\`\`

\`\`\`html
<html lang="en" nve-theme="dark">
\`\`\`

<nve-alert status="warning">
  If your application cannot access root nodes like html or body then apply nve-theme="root" to set the root background colors and fonts.
</nve-alert>

## Autodetect Preferences

Themes can be applied dynamically based on user preferences.

\`\`\`javascript
 if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
   document.body.setAttribute('nve-theme', 'dark');
 }

 if (window.matchMedia('(-ms-high-contrast: active)').matches || window.matchMedia('(forced-colors: active)').matches) {
   document.body.setAttribute('nve-theme', 'high-contrast');
 }

 if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
   document.body.setAttribute('nve-theme', 'reduced-motion');
 }
\`\`\`

## Dark

\`\`\`css
@import '@nvidia-elements/themes/dark.css';
\`\`\`

${getThemeDemo('dark')}

## Light (Default)

\`\`\`css
@import '@nvidia-elements/themes/index.css';
\`\`\`

${getThemeDemo('light')}

## Debug

The \`debug\` theme will highlight elements with a green outline, layouts with a purple outline and typography with a gold outline.

\`\`\`css
@import '@nvidia-elements/themes/debug.css';
\`\`\`

${getThemeDemo('debug')}

## High Contrast

\`\`\`css
@import '@nvidia-elements/themes/high-contrast.css';
\`\`\`

${getThemeDemo('high-contrast')}

## Brand

The \`brand\` theme is a set of themes that are designed to be used with the \`@nvidia-elements/brand\` package.
[Learn more](docs/labs/brand/).

\`\`\`css
\`\`\`

${getThemeDemo('brand-dark')}
`,
    'md'
  );
}

function getThemeDemo(theme) {
  return /* html */ `
    <div nve-theme="root ${theme}" nve-layout="grid span-items:6 gap:md pad:md">
      <nve-card>${getThemeContent()}</nve-card>
      ${getThemeContent()}
    </div>
  `
    .replace(/\n/g, '')
    .trim();
}

function getThemeContent() {
  return /* html */ `
    <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px">
      <div nve-layout="row gap:sm">
        <nve-button>default</nve-button>
        <nve-button interaction="emphasis">emphasis</nve-button>
        <nve-button interaction="destructive">destructive</nve-button>
        <nve-button disabled="">disabled</nve-button>
      </div>
      <div nve-layout="column gap:md">
        <nve-input>
          <label>label</label>
          <input type="text" value="text">
          <nve-control-message>message</nve-control-message>
        </nve-input>
        <nve-select>
          <label>label</label>
          <select>
            <option value="1">option 1</option>
            <option value="2">option 2</option>
            <option value="3">option 3</option>
          </select>
          <nve-control-message>message</nve-control-message>
        </nve-select>
      </div>
      <div nve-layout="column gap:md">
        <nve-alert>default</nve-alert>
        <nve-alert status="accent">accent</nve-alert>
        <nve-alert status="warning">warning</nve-alert>
        <nve-alert status="success">success</nve-alert>
        <nve-alert status="danger">danger</nve-alert>
      </div>
    </div>
    `;
}

---
{
  title: 'Installation',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## NPM/Artifactory

Add the following references to the `.npmrc` file in the root of your project where your `package.json` is located.

```shell
registry=https://registry.npmjs.org
```

Login to [Artifactory](https://registry.npmjs.org once logged in run the following:

```shell
npm login
```

Install base packages:

```shell
npm install @nvidia-elements/themes @nvidia-elements/styles @nvidia-elements/core
```

## Usage

Elements is split into multiple small packages. This allows you to choose what
tools are needed for your application and omit anything unnecessary, improving
overall application performance.

```css
/* base theme */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';

/* optional themes */
@import '@nvidia-elements/themes/high-contrast.css';
@import '@nvidia-elements/themes/reduced-motion.css';
@import '@nvidia-elements/themes/compact.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/themes/debug.css';

/* optional CSS utilities */
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/view-transitions.css';
```

```typescript
// Load via typescript imports to make available in HTML templates
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dot/define.js';
...
```

```html
<!-- set global theme -->
<html nve-theme="dark" nve-transition="auto">
```

```html
<!-- use component in HTML template -->
<nve-button>hello there</nve-button>
```

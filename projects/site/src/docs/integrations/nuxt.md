---
{
  title: 'Nuxt',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'nuxt' %}

{% installation 'nuxt' %}

Once installation is complete Elements can be imported and used within [Nuxt](https://nuxt.com/) Vue SFC files. Since Nuxt is built on top of Vue, the same Vue template syntax applies.

## Configuration

Configure `nuxt.config.ts` to recognize Elements as custom elements and set up the global theme attributes.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('nve-')
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
        'nve-theme': 'dark',
        'nve-transition': 'auto'
      }
    }
  }
});
```

## Styles

Import the Elements theme and utility styles in your `app.vue` file. This ensures styles are available globally throughout your application.

```html
<style>
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/view-transitions.css';
</style>
```

## Usage

Import element definitions in the `<script setup>` block of your Vue SFC files.

```typescript
import '@nvidia-elements/core/alert/define.js';
```

Once added, properties and events can be used via the standard Vue template syntax.

```typescript
// - status - HTML attribute
// - :closable - can update via attributes or JavaScript property binding
// - @close - event listener binding for 'close' custom event
```

```html
<nve-alert-group status="success">
  <nve-alert :closable="true" @close="closeAlert">hello there!</nve-alert>
</nve-alert-group>
```

## Layouts

Elements can be used within Nuxt layouts to create consistent page structures.

```html
<!-- layouts/default.vue -->
<template>
  <nve-page>
    <nve-page-header slot="header">
      <nve-logo slot="prefix" size="sm"></nve-logo>
      <h2 slot="prefix">My App</h2>
    </nve-page-header>
    <main nve-layout="column gap:lg pad:lg">
      <slot />
    </main>
  </nve-page>
</template>

<script setup lang="ts">
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/logo/define.js';
</script>
```

## Routing

Elements work seamlessly with Nuxt's built-in routing. Use `NuxtLink` within Elements components for client-side navigation.

```html
<nve-tabs>
  <nve-tabs-item selected>
    <NuxtLink to="/">Home</NuxtLink>
  </nve-tabs-item>
  <nve-tabs-item>
    <NuxtLink to="/about">About</NuxtLink>
  </nve-tabs-item>
</nve-tabs>
```

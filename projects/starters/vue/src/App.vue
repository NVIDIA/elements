<script setup lang="ts">
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/logo/define.js';
</script>

<template>
  <nve-page>
    <nve-page-header slot="header">
      <nve-logo slot="prefix" size="sm"></nve-logo>
      <a slot="prefix" href="https://NVIDIA.github.io/elements/">Elements</a>
      <nve-button container="flat"><a href="https://NVIDIA.github.io/elements/docs/integrations/angular/" target="_blank">Catalog</a></nve-button>
      <nve-button container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">Playground</a></nve-button>
      <nve-button container="flat"><a href="https://NVIDIA.github.io/elements/starters/">Starters</a></nve-button>
      <nve-button container="flat"><a href="https://github.com/NVIDIA/elements/" target="_blank">Gitlab</a></nve-button>
    </nve-page-header>
    <nve-page-panel slot="left" size="sm">
      <nve-page-panel-content>
        <nve-menu>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/starters/angular/">Angular</a></nve-menu-item>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/starters/bundles/">Bundles</a></nve-menu-item>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/starters/eleventy/">Eleventy</a></nve-menu-item>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/starters/importmaps/">Import Maps</a></nve-menu-item>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/starters/mpa/">MPA</a></nve-menu-item>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/starters/react/">React</a></nve-menu-item>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/starters/solidjs/">SolidJS</a></nve-menu-item>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/starters/typescript/">TypeScript</a></nve-menu-item>
          <nve-menu-item current="page"><a href="https://NVIDIA.github.io/elements/starters/vue/">Vue</a></nve-menu-item>
          <nve-divider></nve-divider>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/docs/integrations/go/" target="_blank">Go</a></nve-menu-item>
          <nve-menu-item><a href="https://NVIDIA.github.io/elements/docs/integrations/nextjs/" target="_blank">NextJS</a></nve-menu-item>
        </nve-menu>
      </nve-page-panel-content>
    </nve-page-panel>
    <main nve-layout="column gap:lg pad:lg">
      <div nve-layout="row gap:sm align:vertical-center">
        <img src="https://NVIDIA.github.io/elements/static/images/integrations/vue.svg" width="36px" height="36px" alt="vue logo">
        <h1 nve-text="heading xl">Vue</h1>
      </div>
      <p nve-text="body">A simple starter using Elements and Vue.</p>
      <div nve-layout="row gap:xs">
        <a nve-text="body sm" target="_blank" href="https://NVIDIA.github.io/elements/docs/integrations/vue/">Documentation</a>
        <a nve-text="body sm" target="_blank" href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/vue">Source</a>
        <a nve-text="body sm" download href="https://NVIDIA.github.io/elements/starters/download/vue.zip">Download</a>
      </div>
    </main>
  </nve-page>
</template>

<style scoped></style>

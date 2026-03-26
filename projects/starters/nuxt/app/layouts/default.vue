<template>
  <nve-page>
    <nve-page-header slot="header">
      <nve-logo slot="prefix" size="sm"></nve-logo>
      <a slot="prefix" href="https://NVIDIA.github.io/elements/">Elements</a>
      <nve-button container="flat"
        ><a href="https://NVIDIA.github.io/elements/docs/integrations/angular/" target="_blank"
          >Catalog</a
        ></nve-button
      >
      <nve-button container="flat"
        ><a href="https://NVIDIA.github.io/elements/starters/">Starters</a></nve-button
      >
      <nve-button container="flat"
        ><a href="https://github.com/NVIDIA/elements/" target="_blank">Gitlab</a></nve-button
      >
    </nve-page-header>
    <nve-page-panel slot="left" size="sm">
      <nve-page-panel-content>
        <nve-menu>
          <nve-menu-item
            ><a target="_blank" href="https://NVIDIA.github.io/elements/docs/integrations/nuxt/"
              >Documentation</a
            ></nve-menu-item
          >
          <nve-menu-item
            ><a
              target="_blank"
              href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/nuxt"
              >Source</a
            ></nve-menu-item
          >
          <nve-menu-item
            ><a download href="https://NVIDIA.github.io/elements/starters/download/nuxt.zip"
              >Download</a
            ></nve-menu-item
          >
        </nve-menu>
      </nve-page-panel-content>
    </nve-page-panel>
    <main nve-layout="column gap:lg pad:lg">
      <div nve-layout="row gap:xs align:vertical-center">
        <img
          src="https://NVIDIA.github.io/elements/static/images/integrations/nuxt.svg"
          width="36px"
          height="36px"
          alt="nuxt logo" />
        <h1 nve-text="heading xl">Nuxt</h1>
      </div>
      <nve-tabs>
        <nve-tabs-item selected>
          <NuxtLink to="/">Home</NuxtLink>
        </nve-tabs-item>
        <nve-tabs-item>
          <NuxtLink to="/about">About</NuxtLink>
        </nve-tabs-item>
      </nve-tabs>
      <slot />
    </main>
  </nve-page>
</template>

<script setup lang="ts">
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/tabs/define.js';
</script>

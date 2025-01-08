<script setup lang="ts">
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/menu/define.js';
import '@nvidia-elements/core/logo/define.js';
</script>

<template>
  <nve-page>
    <nve-page-header slot="header">
      <nve-logo slot="prefix" size="sm"></nve-logo>
      <a slot="prefix" href="/elements/">Elements</a>
      <nve-button container="flat"
        ><a href="/elements/api/?path=/docs/about-installation--docs">Get Started</a></nve-button
      >
      <nve-button container="flat"
        ><a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">Playground</a></nve-button
      >
      <nve-button selected=" " container="flat"><a href="/elements/starters/buildless/">Starters</a></nve-button>
      <nve-button container="flat"
        ><a href="https://github.com/NVIDIA/elements/" target="_blank">Gitlab</a></nve-button
      >
    </nve-page-header>
    <nve-page-panel slot="left" size="sm">
      <nve-page-panel-header>
        <div nve-layout="row gap:xs align:vertical-center">Starters</div>
      </nve-page-panel-header>
      <nve-page-panel-content>
        <nve-menu>
          <nve-menu-item>
            <a href="/elements/starters/buildless/">
              <img src="/javascript.svg" width="18px" height="18px" alt="javascript logo" />
              Buildless
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <a href="/elements/starters/typescript/">
              <img src="/typescript.svg" width="18px" height="18px" alt="typescript logo" />
              TypeScript
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <a href="/elements/starters/eleventy/">
              <img src="/eleventy.svg" width="18px" height="18px" alt="eleventy logo" />
              Eleventy
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <a href="/elements/starters/angular/">
              <img src="/angular.svg" width="18px" height="18px" alt="angular logo" />
              Angular
            </a>
          </nve-menu-item>
          <nve-menu-item current="page">
            <a href="/elements/starters/vue/">
              <img src="/vue.svg" width="18px" height="18px" alt="vue logo" />
              Vue
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <a href="/elements/starters/react/">
              <img src="/react.svg" width="18px" height="18px" alt="react logo" />
              React
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <a href="/elements/starters/solidjs/">
              <img src="/solidjs.svg" width="18px" height="18px" alt="solidjs logo" />
              SolidJS
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="template"></nve-icon>
            <a href="/elements/starters/mpa/">MPA</a>
          </nve-menu-item>
        </nve-menu>
      </nve-page-panel-content>
    </nve-page-panel>
    <main nve-layout="column gap:lg">
      <nve-breadcrumb>
        <nve-button><a href="/elements/starters/buildless/">Elements</a></nve-button>
        <nve-button><a href="/elements/starters/buildless/" target="_self">Starters</a></nve-button>
        <span>Vue</span>
      </nve-breadcrumb>
      <h1 nve-text="heading xl">Vue</h1>
      <p nve-text="body">A simple starter using Elements and Vue.</p>
      <ul nve-text="list" nve-layout="column gap:xs">
        <li>
          <a
            nve-text="link"
            target="_blank"
            href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/vue"
            >Source</a
          >
        </li>
        <li>
          <a
            nve-text="link"
            target="_blank"
            href="https://NVIDIA.github.io/elements/api/?path=/docs/integrations-vue--docs"
            >Documentation</a
          >
        </li>
        <li>
          <a
            download
            nve-text="link"
            target="_blank"
            href="https://NVIDIA.github.io/elements/starters/download/vue.zip"
            >Download</a
          >
        </li>
      </ul>
    </main>
  </nve-page>
</template>

<style scoped></style>

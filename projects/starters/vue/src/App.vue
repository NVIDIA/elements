<script setup lang="ts">
import '@elements/elements/app-header/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/drawer/define.js';
import '@elements/elements/menu/define.js';
</script>

<template>
  <mlv-app-header>
    <mlv-logo></mlv-logo>
    <h2 slot="title">Elements</h2>
    <mlv-button slot="nav-items" selected=" "><a href="/elements/starters/buildless/">Starters</a></mlv-button>
    <mlv-button slot="nav-items"
      ><a href="https://NVIDIA.github.io/elements/api/" target="_blank">API</a></mlv-button
    >
    <mlv-button slot="nav-items"
      ><a href="https://github.com/NVIDIA/elements/" target="_blank">Gitlab</a></mlv-button
    >
    <mlv-button slot="nav-items"
      ><a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">Playground</a></mlv-button
    >
    <mlv-icon-button icon-name="switch-apps" slot="nav-actions"></mlv-icon-button>
  </mlv-app-header>
  <div mlv-layout="row" style="height: 100%">
    <mlv-drawer .inline="true" size="sm" style="--top: 48px; display: block">
      <mlv-drawer-header>
        <div mlv-layout="row gap:xs align:vertical-center">Starters</div>
      </mlv-drawer-header>
      <mlv-drawer-content>
        <mlv-menu>
          <mlv-menu-item>
            <a href="/elements/starters/buildless/">
              <img src="/javascript.svg" width="18px" height="18px" alt="javascript logo" />
              Buildless
            </a>
          </mlv-menu-item>
          <mlv-menu-item>
            <a href="/elements/starters/typescript/">
              <img src="/typescript.svg" width="18px" height="18px" alt="typescript logo" />
              TypeScript
            </a>
          </mlv-menu-item>
          <mlv-menu-item>
            <a href="/elements/starters/angular/">
              <img src="/angular.svg" width="18px" height="18px" alt="angular logo" />
              Angular
            </a>
          </mlv-menu-item>
          <mlv-menu-item current="page">
            <a href="/elements/starters/vue/">
              <img src="/vue.svg" width="18px" height="18px" alt="vue logo" />
              Vue
            </a>
          </mlv-menu-item>
          <mlv-menu-item>
            <a href="/elements/starters/react/">
              <img src="/react.svg" width="18px" height="18px" alt="react logo" />
              React
            </a>
          </mlv-menu-item>
          <mlv-menu-item>
            <a href="/elements/starters/solidjs/">
              <img src="/solidjs.svg" width="18px" height="18px" alt="solidjs logo" />
              SolidJS
            </a>
          </mlv-menu-item>
          <mlv-menu-item>
            <mlv-icon name="template"></mlv-icon>
            <a href="/elements/starters/mpa/">MPA</a>
          </mlv-menu-item>
        </mlv-menu>
      </mlv-drawer-content>
    </mlv-drawer>
    <main mlv-layout="column gap:lg pad-x:xl pad-y:md align:stretch">
      <mlv-breadcrumb>
        <mlv-button><a href="/elements/starters/buildless/">Elements</a></mlv-button>
        <mlv-button><a href="/elements/starters/buildless/" target="_self">Starters</a></mlv-button>
        <span>Vue</span>
      </mlv-breadcrumb>
      <h1 mlv-text="heading xl">Vue</h1>
      <p mlv-text="body">A simple starter using Elements and Vue.</p>
      <ul mlv-text="list" mlv-layout="column gap:xs">
        <li>
          <a
            mlv-text="link"
            target="_blank"
            href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/vue"
            >Source</a
          >
        </li>
        <li>
          <a
            mlv-text="link"
            target="_blank"
            href="https://NVIDIA.github.io/elements/api/?path=/docs/integrations-vue--docs"
            >Documentation</a
          >
        </li>
      </ul>
    </main>
  </div>
</template>

<style scoped></style>

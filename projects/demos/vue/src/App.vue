<script setup lang="ts">
  import '@elements/elements/app-header/define.js';
  import '@elements/elements/button/define.js';
  import '@elements/elements/breadcrumb/define.js';
  import '@elements/elements/drawer/define.js';
  import '@elements/elements/menu/define.js';
</script>

<template>
  <nve-app-header>
    <nve-logo></nve-logo>
    <h2 slot="title">Elements</h2>
    <nve-button slot="nav-items" selected=" "><a href="/elements/demos/buildless/">Demos</a></nve-button>
    <nve-button slot="nav-items"><a href="https://NVIDIA.github.io/elements/api/" target="_blank">API</a></nve-button>
    <nve-button slot="nav-items"><a href="https://github.com/NVIDIA/elements/" target="_blank">Gitlab</a></nve-button>
    <nve-button slot="nav-items"><a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">Playground</a></nve-button>
    <nve-icon-button icon-name="switch-apps" slot="nav-actions"></nve-icon-button>
  </nve-app-header>
  <div nve-layout="row" style="height: 100%">
    <nve-drawer .inline="true" size="sm" style="--top: 48px; display: block">
      <nve-drawer-header>
        <div nve-layout="row gap:xs align:vertical-center">Demos</div>
      </nve-drawer-header>
      <nve-drawer-content>
        <nve-menu>
          <nve-menu-item>
            <a href="/elements/demos/buildless/">
              <img src="/javascript.svg" width="18px" height="18px" alt="javascript logo" />
              Buildless
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <a href="/elements/demos/typescript/">
              <img src="/typescript.svg" width="18px" height="18px" alt="typescript logo" />
              TypeScript
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <a href="/elements/demos/angular/">
              <img src="/angular.svg" width="18px" height="18px" alt="angular logo" />
              Angular
            </a>
          </nve-menu-item>
          <nve-menu-item current="page">
            <a href="/elements/demos/vue/">
              <img src="/vue.svg" width="18px" height="18px" alt="vue logo" />
              Vue
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <a href="/elements/demos/react/">
              <img src="/react.svg" width="18px" height="18px" alt="react logo" />
              React
            </a>
          </nve-menu-item>
          <nve-menu-item>
            <nve-icon name="template"></nve-icon>
            <a href="/elements/demos/mpa/">MPA</a>
          </nve-menu-item>
        </nve-menu>
      </nve-drawer-content>
    </nve-drawer>
    <main nve-layout="column gap:lg pad-x:xl pad-y:md align:stretch">
      <nve-breadcrumb>
        <nve-button><a href="/elements/demos/buildless/">Elements</a></nve-button>
        <nve-button><a href="/elements/demos/buildless/" target="_self">Demos</a></nve-button>
        <span>Vue</span>
      </nve-breadcrumb>
      <h1 nve-text="heading xl">Vue</h1>
      <p nve-text="body">A simple starter using Elements and Vue.</p>
      <ul nve-text="list" nve-layout="column gap:xs">
        <li><a nve-text="link" target="_blank" href="https://github.com/NVIDIA/elements/-/tree/main/projects/demos/vue">Source</a></li>
        <li><a nve-text="link" target="_blank" href="https://NVIDIA.github.io/elements/api/?path=/docs/integrations-vue--docs">Documentation</a></li>
      </ul>
    </main>
  </div>
</template>

<style scoped>

</style>

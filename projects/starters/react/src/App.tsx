import React from 'react';
import { NveAppHeader } from '@nvidia-elements/core-react/app-header';
import { NveButton } from '@nvidia-elements/core-react/button';
import { NveIconButton } from '@nvidia-elements/core-react/icon-button';
import { NveLogo } from '@nvidia-elements/core-react/logo';
import { NveBreadcrumb } from '@nvidia-elements/core-react/breadcrumb';
import { NveDrawer, NveDrawerContent, NveDrawerHeader } from '@nvidia-elements/core-react/drawer';
import { NveMenu, NveMenuItem } from '@nvidia-elements/core-react/menu';

function App() {
  return (
    <div>
      <NveAppHeader>
        <NveLogo></NveLogo>
        <h2 slot="title">Elements</h2>
        <NveButton slot="nav-items" selected>
          <a href="/elements/starters/buildless/">Starters</a>
        </NveButton>
        <NveButton slot="nav-items">
          <a href="https://NVIDIA.github.io/elements/api/" target="_blank">
            API
          </a>
        </NveButton>
        <NveButton slot="nav-items">
          <a href="https://github.com/NVIDIA/elements/" target="_blank">
            Gitlab
          </a>
        </NveButton>
        <NveButton slot="nav-items">
          <a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">
            Playground
          </a>
        </NveButton>
        <NveIconButton icon-name="switch-apps" slot="nav-actions"></NveIconButton>
      </NveAppHeader>
      <div Nve-layout="row" style={{ height: '100%' }}>
        <NveDrawer inline size="sm" style={{ '--top': '48px', display: 'block' }}>
          <NveDrawerHeader>
            <div Nve-layout="row gap:xs align:vertical-center">Starters</div>
          </NveDrawerHeader>
          <NveDrawerContent>
            <NveMenu>
              <NveMenuItem>
                <a href="/elements/starters/buildless/">
                  <img src="/elements/starters/react/javascript.svg" width="18px" height="18px" alt="javascript logo" />
                  Buildless
                </a>
              </NveMenuItem>
              <NveMenuItem>
                <a href="/elements/starters/typescript/">
                  <img src="/elements/starters/react/typescript.svg" width="18px" height="18px" alt="typescript logo" />
                  TypeScript
                </a>
              </NveMenuItem>
              <NveMenuItem>
                <a href="/elements/starters/eleventy/">
                  <img src="/elements/starters/react/eleventy.svg" width="18px" height="18px" alt="eleventy logo" />
                  Eleventy
                </a>
              </NveMenuItem>
              <NveMenuItem>
                <a href="/elements/starters/angular/">
                  <img src="/elements/starters/react/angular.svg" width="18px" height="18px" alt="angular logo" />
                  Angular
                </a>
              </NveMenuItem>
              <NveMenuItem>
                <a href="/elements/starters/vue/">
                  <img src="/elements/starters/react/vue.svg" width="18px" height="18px" alt="vue logo" />
                  Vue
                </a>
              </NveMenuItem>
              <NveMenuItem current="page">
                <a href="/elements/starters/react/">
                  <img src="/elements/starters/react/react.svg" width="18px" height="18px" alt="react logo" />
                  React
                </a>
              </NveMenuItem>
              <NveMenuItem>
                <a href="/elements/starters/solidjs/">
                  <img src="/elements/starters/react/solidjs.svg" width="18px" height="18px" alt="solidjs logo" />
                  SolidJS
                </a>
              </NveMenuItem>
              <NveMenuItem>
                <Nve-icon name="template"></Nve-icon>
                <a href="/elements/starters/mpa/">MPA</a>
              </NveMenuItem>
            </NveMenu>
          </NveDrawerContent>
        </NveDrawer>
        <main Nve-layout="column gap:lg pad-x:xl pad-y:md align:stretch">
          <NveBreadcrumb>
            <NveButton>
              <a href="/elements/starters/buildless/">Elements</a>
            </NveButton>
            <NveButton>
              <a href="/elements/starters/buildless/" target="_self">
                Starters
              </a>
            </NveButton>
            <span>React</span>
          </NveBreadcrumb>
          <h1 Nve-text="heading xl">React</h1>
          <p Nve-text="body">A simple starter using Elements and React.</p>
          <ul Nve-text="list" Nve-layout="column gap:xs">
            <li>
              <a
                Nve-text="link"
                target="_blank"
                href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/react">
                Source
              </a>
            </li>
            <li>
              <a
                Nve-text="link"
                target="_blank"
                href="https://NVIDIA.github.io/elements/api/?path=/docs/integrations-react--docs">
                Documentation
              </a>
            </li>
            <li>
              <a
                download
                nve-text="link"
                target="_blank"
                href="https://NVIDIA.github.io/elements/starters/download/react.zip">
                Download
              </a>
            </li>
          </ul>
        </main>
      </div>
    </div>
  );
}

export default App;

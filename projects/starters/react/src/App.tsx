import React from 'react';
import { MlvAppHeader } from '@elements/elements-react/app-header';
import { MlvButton } from '@elements/elements-react/button';
import { MlvIconButton } from '@elements/elements-react/icon-button';
import { MlvLogo } from '@elements/elements-react/logo';
import { MlvBreadcrumb } from '@elements/elements-react/breadcrumb';
import { MlvDrawer, MlvDrawerContent, MlvDrawerHeader } from '@elements/elements-react/drawer';
import { MlvMenu, MlvMenuItem } from '@elements/elements-react/menu';

function App() {
  return (
    <div>
      <MlvAppHeader>
        <MlvLogo></MlvLogo>
        <h2 slot="title">Elements</h2>
        <MlvButton slot="nav-items" selected>
          <a href="/elements/starters/buildless/">Starters</a>
        </MlvButton>
        <MlvButton slot="nav-items">
          <a href="https://NVIDIA.github.io/elements/api/" target="_blank">
            API
          </a>
        </MlvButton>
        <MlvButton slot="nav-items">
          <a href="https://github.com/NVIDIA/elements/" target="_blank">
            Gitlab
          </a>
        </MlvButton>
        <MlvButton slot="nav-items">
          <a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">
            Playground
          </a>
        </MlvButton>
        <MlvIconButton icon-name="switch-apps" slot="nav-actions"></MlvIconButton>
      </MlvAppHeader>
      <div nve-layout="row" style={{ height: '100%' }}>
        <MlvDrawer inline size="sm" style={{ '--top': '48px', display: 'block' }}>
          <MlvDrawerHeader>
            <div nve-layout="row gap:xs align:vertical-center">Starters</div>
          </MlvDrawerHeader>
          <MlvDrawerContent>
            <MlvMenu>
              <MlvMenuItem>
                <a href="/elements/starters/buildless/">
                  <img src="/elements/starters/react/javascript.svg" width="18px" height="18px" alt="javascript logo" />
                  Buildless
                </a>
              </MlvMenuItem>
              <MlvMenuItem>
                <a href="/elements/starters/typescript/">
                  <img src="/elements/starters/react/typescript.svg" width="18px" height="18px" alt="typescript logo" />
                  TypeScript
                </a>
              </MlvMenuItem>
              <MlvMenuItem>
                <a href="/elements/starters/angular/">
                  <img src="/elements/starters/react/angular.svg" width="18px" height="18px" alt="angular logo" />
                  Angular
                </a>
              </MlvMenuItem>
              <MlvMenuItem>
                <a href="/elements/starters/vue/">
                  <img src="/elements/starters/react/vue.svg" width="18px" height="18px" alt="vue logo" />
                  Vue
                </a>
              </MlvMenuItem>
              <MlvMenuItem current="page">
                <a href="/elements/starters/react/">
                  <img src="/elements/starters/react/react.svg" width="18px" height="18px" alt="react logo" />
                  React
                </a>
              </MlvMenuItem>
              <MlvMenuItem>
                <a href="/elements/starters/solidjs/">
                  <img src="/elements/starters/react/solidjs.svg" width="18px" height="18px" alt="solidjs logo" />
                  SolidJS
                </a>
              </MlvMenuItem>
              <MlvMenuItem>
                <nve-icon name="template"></nve-icon>
                <a href="/elements/starters/mpa/">MPA</a>
              </MlvMenuItem>
            </MlvMenu>
          </MlvDrawerContent>
        </MlvDrawer>
        <main nve-layout="column gap:lg pad-x:xl pad-y:md align:stretch">
          <MlvBreadcrumb>
            <MlvButton>
              <a href="/elements/starters/buildless/">Elements</a>
            </MlvButton>
            <MlvButton>
              <a href="/elements/starters/buildless/" target="_self">
                Starters
              </a>
            </MlvButton>
            <span>React</span>
          </MlvBreadcrumb>
          <h1 nve-text="heading xl">React</h1>
          <p nve-text="body">A simple starter using Elements and React.</p>
          <ul nve-text="list" nve-layout="column gap:xs">
            <li>
              <a
                nve-text="link"
                target="_blank"
                href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/react">
                Source
              </a>
            </li>
            <li>
              <a
                nve-text="link"
                target="_blank"
                href="https://NVIDIA.github.io/elements/api/?path=/docs/integrations-react--docs">
                Documentation
              </a>
            </li>
          </ul>
        </main>
      </div>
    </div>
  );
}

export default App;

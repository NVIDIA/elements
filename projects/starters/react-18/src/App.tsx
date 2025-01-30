import React from 'react';
import { NvePageHeader } from '@nvidia-elements/core-react/page-header';
import { NveButton } from '@nvidia-elements/core-react/button';
import { NveIcon } from '@nvidia-elements/core-react/icon';
import { NveLogo } from '@nvidia-elements/core-react/logo';
import { NveBreadcrumb } from '@nvidia-elements/core-react/breadcrumb';
import { NvePage, NvePagePanel, NvePagePanelContent, NvePagePanelHeader } from '@nvidia-elements/core-react/page';
import { NveMenu, NveMenuItem } from '@nvidia-elements/core-react/menu';

function App() {
  return (
    <NvePage>
      <NvePageHeader slot="header">
        <NveLogo slot="prefix" size="sm"></NveLogo>
        <a slot="prefix" href="/elements/">
          Elements
        </a>
        <NveButton container="flat">
          <a href="/elements/api/?path=/docs/about-installation--docs">Get Started</a>
        </NveButton>
        <NveButton container="flat">
          <a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">
            Playground
          </a>
        </NveButton>
        <NveButton selected container="flat">
          <a href="/elements/starters/buildless/">Starters</a>
        </NveButton>
        <NveButton container="flat">
          <a href="https://github.com/NVIDIA/elements/" target="_blank">
            Gitlab
          </a>
        </NveButton>
      </NvePageHeader>
      <NvePagePanel slot="left" size="sm">
        <NvePagePanelHeader>
          <div nve-layout="row gap:xs align:vertical-center">Starters</div>
        </NvePagePanelHeader>
        <NvePagePanelContent>
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
              <NveIcon name="template"></NveIcon>
              <a href="/elements/starters/mpa/">MPA</a>
            </NveMenuItem>
          </NveMenu>
        </NvePagePanelContent>
      </NvePagePanel>
      <main nve-layout="column gap:lg pad:lg align:horizontal-stretch">
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
    </NvePage>
  );
}

export default App;

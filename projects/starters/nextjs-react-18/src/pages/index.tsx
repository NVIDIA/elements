import React from 'react';
import '@nvidia-elements/core/icon/server.js';
import { NveButton } from '@nvidia-elements/core-react/button';
import { NveIcon } from '@nvidia-elements/core-react/icon';
import { NveLogo } from '@nvidia-elements/core-react/logo';
import { NveBreadcrumb } from '@nvidia-elements/core-react/breadcrumb';
import { NvePage, NvePagePanel, NvePagePanelContent, NvePagePanelHeader } from '@nvidia-elements/core-react/page';
import { NveMenu, NveMenuItem } from '@nvidia-elements/core-react/menu';
import { NvePageHeader } from '@nvidia-elements/core-react/page-header';

export default function Home() {
  return (
    <NvePage>
      <NvePageHeader slot="header">
        <NveLogo slot="prefix"></NveLogo>
        <h2 slot="prefix">Elements</h2>
        <NveButton container="flat" selected>
          <a href="/elements/starters/buildless/">Starters</a>
        </NveButton>
        <NveButton container="flat">
          <a href="https://NVIDIA.github.io/elements/api/" target="_blank">
            API
          </a>
        </NveButton>
        <NveButton container="flat">
          <a href="https://github.com/NVIDIA/elements/" target="_blank">
            Gitlab
          </a>
        </NveButton>
        <NveButton container="flat">
          <a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">
            Playground
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
                <img src="/elements/starters/nextjs/javascript.svg" width="18px" height="18px" alt="javascript logo" />
                Buildless
              </a>
            </NveMenuItem>
            <NveMenuItem>
              <a href="/elements/starters/typescript/">
                <img src="/elements/starters/nextjs/typescript.svg" width="18px" height="18px" alt="typescript logo" />
                TypeScript
              </a>
            </NveMenuItem>
            <NveMenuItem>
              <a href="/elements/starters/eleventy/">
                <img src="/elements/starters/nextjs/eleventy.svg" width="18px" height="18px" alt="eleventy logo" />
                Eleventy
              </a>
            </NveMenuItem>
            <NveMenuItem>
              <a href="/elements/starters/angular/">
                <img src="/elements/starters/nextjs/angular.svg" width="18px" height="18px" alt="angular logo" />
                Angular
              </a>
            </NveMenuItem>
            <NveMenuItem>
              <a href="/elements/starters/vue/">
                <img src="/elements/starters/nextjs/vue.svg" width="18px" height="18px" alt="vue logo" />
                Vue
              </a>
            </NveMenuItem>
            <NveMenuItem>
              <a href="/elements/starters/react/">
                <img src="/elements/starters/nextjs/react.svg" width="18px" height="18px" alt="react logo" />
                React
              </a>
            </NveMenuItem>
            <NveMenuItem current="page">
              <a href="/elements/starters/nextjs/">
                <img src="/elements/starters/nextjs/nextjs.svg" width="18px" height="18px" alt="nextjs logo" />
                NextJS
              </a>
            </NveMenuItem>
            <NveMenuItem>
              <a href="/elements/starters/solidjs/">
                <img src="/elements/starters/nextjs/solidjs.svg" width="18px" height="18px" alt="solidjs logo" />
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
      <main nve-layout="column gap:lg">
        <NveBreadcrumb>
          <NveButton container="inline">
            <a href="/elements/starters/buildless/">Elements</a>
          </NveButton>
          <NveButton container="inline">
            <a href="/elements/starters/buildless/" target="_self">
              Starters
            </a>
          </NveButton>
          <span>NextJS</span>
        </NveBreadcrumb>
        <h1 nve-text="heading xl">NextJS</h1>
        <p nve-text="body">A SSG (static site generation) starter using Elements and NextJS.</p>
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

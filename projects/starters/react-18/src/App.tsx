import React from 'react';
import { NvePageHeader } from '@nvidia-elements/core-react/page-header';
import { NveButton } from '@nvidia-elements/core-react/button';
import { NveDivider } from '@nvidia-elements/core-react/divider';
import { NveLogo } from '@nvidia-elements/core-react/logo';
import { NvePage, NvePagePanel, NvePagePanelContent, NvePagePanelHeader } from '@nvidia-elements/core-react/page';
import { NveMenu, NveMenuItem } from '@nvidia-elements/core-react/menu';

function App() {
  return (
    <NvePage>
      <NvePageHeader slot="header">
        <NveLogo slot="prefix" size="sm"></NveLogo>
        <a slot="prefix" href="/elements/">Elements</a>
        <NveButton container="flat"><a href="/elements/docs/about/getting-started/">Catalog</a></NveButton>
        <NveButton container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">Playground</a></NveButton>
        <NveButton selected container="flat"><a href="/elements/starters/">Starters</a></NveButton>
        <NveButton container="flat"><a href="https://github.com/NVIDIA/elements/" target="_blank">Gitlab</a></NveButton>
      </NvePageHeader>
      <NvePagePanel slot="left" size="sm">
        <NvePagePanelHeader>
          <div nve-layout="row gap:xs align:vertical-center">Starters</div>
        </NvePagePanelHeader>
        <NvePagePanelContent>
          <NveMenu>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/angular/">Angular</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/bundles/">Bundles</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/eleventy/">Eleventy</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/importmaps/">Import Maps</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/mpa/">MPA</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/react/">React</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/solidjs/">SolidJS</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/svelte/">Svelte</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/typescript/">TypeScript</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/starters/vue/">Vue</a></NveMenuItem>
            <NveDivider></NveDivider>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/docs/integrations/go/" target="_blank">Go</a></NveMenuItem>
            <NveMenuItem><a href="https://NVIDIA.github.io/elements/docs/integrations/nextjs/" target="_blank">NextJS</a></NveMenuItem>
          </NveMenu>
        </NvePagePanelContent>
      </NvePagePanel>
      <main nve-layout="column gap:lg pad:lg">
        <div nve-layout="row gap:sm align:vertical-center">
          <img src="https://NVIDIA.github.io/elements/static/images/integrations/react.svg" width="36px" height="36px" alt="react logo" />
          <h1 nve-text="heading xl">React 18</h1>
        </div>
        <p nve-text="body">A simple starter using Elements and React 18.</p>
        <div nve-layout="row gap:xs">
          <a nve-text="body sm" target="_blank" href="https://NVIDIA.github.io/elements/docs/integrations/react/">Documentation</a>
          <a nve-text="body sm" target="_blank" href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/react">Source</a>
          <a nve-text="body sm" download href="https://NVIDIA.github.io/elements/starters/download/react-18.zip">Download</a>
        </div>
      </main>
    </NvePage>
  );
}

export default App;

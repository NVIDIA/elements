import React from 'react';
import {
  NveAccordionGroup,
  NveAccordion,
  NveAccordionHeader,
  NveAccordionContent
} from '@nvidia-elements/core-react/accordion';
import { NveAlert, NveAlertGroup } from '@nvidia-elements/core-react/alert';
import { NveAppHeader } from '@nvidia-elements/core-react/app-header';
import { NveButton } from '@nvidia-elements/core-react/button';
import { NveIconButton } from '@nvidia-elements/core-react/icon-button';
import { NveButtonGroup } from '@nvidia-elements/core-react/button-group';
import { NveBadge } from '@nvidia-elements/core-react/badge';
import { NveBreadcrumb } from '@nvidia-elements/core-react/breadcrumb';
import { NveCard, NveCardHeader, NveCardContent } from '@nvidia-elements/core-react/card';
import { NveLogo } from '@nvidia-elements/core-react/logo';
import { NveInput } from '@nvidia-elements/core-react/input';

// This demo is used for baseline experimental SSR support testing.
// This demo does not follow the same consistent pattern as the rest of the demo integrations.
export default function Home() {
  const [showDialog, setshowDialog] = React.useState(false);

  return (
    <>
      <NveAppHeader>
        <NveLogo></NveLogo>
        <h2 slot="title">NextJS</h2>
        <NveButton slot="nav-items" container="inline">
          Link 1
        </NveButton>
        <NveButton slot="nav-items" container="inline" selected>
          Link 2
        </NveButton>
        <NveIconButton icon-name="search" slot="nav-actions"></NveIconButton>
        <NveIconButton icon-name="switch-apps" slot="nav-actions"></NveIconButton>
        <NveIconButton interaction="emphasis" slot="nav-actions" size="sm">
          EL
        </NveIconButton>
      </NveAppHeader>

      <div nve-layout="column gap:md pad:lg" style={{ height: '95vh' }}>
        <h1 nve-text="heading">NextJS</h1>

        <NveButton onClick={() => setshowDialog(!showDialog)}>greeting</NveButton>

        <NveAlert status="success">hello there</NveAlert>

        <NveAlertGroup status="accent">
          <NveAlert>
            Standard{' '}
            <NveButton slot="actions" container="flat">
              action
            </NveButton>
          </NveAlert>
        </NveAlertGroup>

        <NveAccordionGroup container="inset" behavior-expand>
          <NveAccordion>
            <NveAccordionHeader>
              <div slot="title">Heading 1</div>
            </NveAccordionHeader>
            <NveAccordionContent>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </NveAccordionContent>
          </NveAccordion>
          <NveAccordion>
            <NveAccordionHeader>
              <div slot="title">Heading 2</div>
            </NveAccordionHeader>
            <NveAccordionContent>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </NveAccordionContent>
          </NveAccordion>
          <NveAccordion>
            <NveAccordionHeader>
              <div slot="title">Heading 3</div>
            </NveAccordionHeader>
            <NveAccordionContent>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </NveAccordionContent>
          </NveAccordion>
        </NveAccordionGroup>

        <div nve-layout="row gap:xs align:wrap">
          <NveBadge status="scheduled">scheduled</NveBadge>
          <NveBadge status="queued">queued</NveBadge>
          <NveBadge status="pending">pending</NveBadge>
          <NveBadge status="starting">starting</NveBadge>
          <NveBadge status="running">running</NveBadge>
          <NveBadge status="restarting">restarting</NveBadge>
          <NveBadge status="stopping">stopping</NveBadge>
          <NveBadge status="finished">finished</NveBadge>
          <NveBadge status="failed">failed</NveBadge>
          <NveBadge status="unknown">unknown</NveBadge>
          <NveBadge status="ignored">ignored</NveBadge>
        </div>

        <NveBreadcrumb>
          <NveButton>
            <a href="#" target="_self">
              Item 1
            </a>
          </NveButton>
          <NveButton>
            <a href="#" target="_self">
              Item 2
            </a>
          </NveButton>
          <NveButton>
            <a href="#" target="_self">
              Item 3
            </a>
          </NveButton>
          <span>You Are Here</span>
        </NveBreadcrumb>

        <div nve-layout="row gap:xs align:wrap">
          <NveButton>standard</NveButton>
          <NveButton interaction="emphasis">emphasis</NveButton>
          <NveButton interaction="destructive">destructive</NveButton>
          <NveButton disabled>disabled</NveButton>
        </div>

        <NveButtonGroup container="rounded" behavior-select="single">
          <NveButton pressed>All Time</NveButton>
          <NveButton>30 Days</NveButton>
          <NveButton>90 Days</NveButton>
        </NveButtonGroup>

        <NveCard nve-layout="full" style={{ height: '300px' }}>
          <NveCardHeader>
            <h2 nve-text="heading">Title</h2>
          </NveCardHeader>
          <NveCardContent>Card Content</NveCardContent>
        </NveCard>

        <NveInput>
          <label slot="label">input</label>
          <input type="text" />
        </NveInput>
      </div>
    </>
  );
}

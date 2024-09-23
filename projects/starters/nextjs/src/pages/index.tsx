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
import { NveDialog } from '@nvidia-elements/core-react/dialog';
import { NveDropdown } from '@nvidia-elements/core-react/dropdown';
import { NveTooltip } from '@nvidia-elements/core-react/tooltip';
import { NveDrawer, NveDrawerHeader } from '@nvidia-elements/core-react/drawer';
import { NveToast } from '@nvidia-elements/core-react/toast';
import { NveNotification } from '@nvidia-elements/core-react/notification';

// This demo is used for baseline experimental SSR support testing.
// This demo does not follow the same consistent pattern as the rest of the demo integrations.
export default function Home() {
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

        <div nve-layout="row align:center gap:lg pad:lg">
          <NveTooltip id="tooltip">hello there</NveTooltip>
          <NveButton popovertarget="tooltip">tooltip</NveButton>

          <NveToast id="toast" close-timeout="1500">
            copied!
          </NveToast>
          <NveButton popovertarget="toast">toast</NveButton>

          <NveDrawer id="drawer" closable modal>
            <NveDrawerHeader>
              <h3 nve-text="heading semibold sm">Title</h3>
            </NveDrawerHeader>
            <p nve-text="body">some text content in a drawer</p>
          </NveDrawer>
          <NveButton popovertarget="drawer">drawer</NveButton>

          <NveDropdown id="dropdown" closable>
            <h3 nve-text="heading">Title</h3>
            <p nve-text="body">some text content in a dropdown</p>
          </NveDropdown>
          <NveButton popovertarget="dropdown">dropdown</NveButton>

          <NveDialog id="dialog" closable modal>
            <h3 nve-text="heading">Title</h3>
            <p nve-text="body">some text content in a closable dialog</p>
          </NveDialog>
          <NveButton popovertarget="dialog">dialog</NveButton>

          <NveNotification id="notification" closable position="bottom" alignment="end" close-timeout="2000">
            <h3 nve-text="label">notification</h3>
            <p nve-text="body">some text content in a notification</p>
          </NveNotification>
          <NveButton popovertarget="notification">notification snackbar</NveButton>
        </div>

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
      </div>
    </>
  );
}

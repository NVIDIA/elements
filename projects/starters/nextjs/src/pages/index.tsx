import React from 'react';
import {
  MlvAccordionGroup,
  MlvAccordion,
  MlvAccordionHeader,
  MlvAccordionContent
} from '@elements/elements-react/accordion';
import { MlvAlert, MlvAlertGroup } from '@elements/elements-react/alert';
import { MlvAppHeader } from '@elements/elements-react/app-header';
import { MlvButton } from '@elements/elements-react/button';
import { MlvIconButton } from '@elements/elements-react/icon-button';
import { MlvButtonGroup } from '@elements/elements-react/button-group';
import { MlvBadge } from '@elements/elements-react/badge';
import { MlvBreadcrumb } from '@elements/elements-react/breadcrumb';
import { MlvCard, MlvCardHeader, MlvCardContent } from '@elements/elements-react/card';
import { MlvLogo } from '@elements/elements-react/logo';
import { MlvInput } from '@elements/elements-react/input';

// This demo is used for baseline experimental SSR support testing.
// This demo does not follow the same consistent pattern as the rest of the demo integrations.
export default function Home() {
  const [showDialog, setshowDialog] = React.useState(false);

  return (
    <>
      <MlvAppHeader>
        <MlvLogo></MlvLogo>
        <h2 slot="title">Nav Actions</h2>
        <MlvButton slot="nav-items" container="inline">
          Link 1
        </MlvButton>
        <MlvButton slot="nav-items" container="inline" selected>
          Link 2
        </MlvButton>
        <MlvIconButton icon-name="search" slot="nav-actions"></MlvIconButton>
        <MlvIconButton icon-name="switch-apps" slot="nav-actions"></MlvIconButton>
        <MlvIconButton interaction="emphasis" slot="nav-actions" size="sm">
          EL
        </MlvIconButton>
      </MlvAppHeader>

      <div nve-layout="column gap:md pad:lg" style={{ height: '95vh' }}>
        <h1 nve-text="heading">NextJS</h1>

        <MlvButton onClick={() => setshowDialog(!showDialog)}>greeting</MlvButton>

        <MlvAlert status="success">hello there</MlvAlert>

        <MlvAlertGroup status="accent">
          <MlvAlert>
            Standard{' '}
            <MlvButton slot="actions" container="flat">
              action
            </MlvButton>
          </MlvAlert>
        </MlvAlertGroup>

        <MlvAccordionGroup container="inset" behavior-expand>
          <MlvAccordion>
            <MlvAccordionHeader>
              <div slot="title">Heading 1</div>
            </MlvAccordionHeader>
            <MlvAccordionContent>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </MlvAccordionContent>
          </MlvAccordion>
          <MlvAccordion>
            <MlvAccordionHeader>
              <div slot="title">Heading 2</div>
            </MlvAccordionHeader>
            <MlvAccordionContent>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </MlvAccordionContent>
          </MlvAccordion>
          <MlvAccordion>
            <MlvAccordionHeader>
              <div slot="title">Heading 3</div>
            </MlvAccordionHeader>
            <MlvAccordionContent>
              Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
            </MlvAccordionContent>
          </MlvAccordion>
        </MlvAccordionGroup>

        <div nve-layout="row gap:xs align:wrap">
          <MlvBadge status="scheduled">scheduled</MlvBadge>
          <MlvBadge status="queued">queued</MlvBadge>
          <MlvBadge status="pending">pending</MlvBadge>
          <MlvBadge status="starting">starting</MlvBadge>
          <MlvBadge status="running">running</MlvBadge>
          <MlvBadge status="restarting">restarting</MlvBadge>
          <MlvBadge status="stopping">stopping</MlvBadge>
          <MlvBadge status="finished">finished</MlvBadge>
          <MlvBadge status="failed">failed</MlvBadge>
          <MlvBadge status="unknown">unknown</MlvBadge>
          <MlvBadge status="ignored">ignored</MlvBadge>
        </div>

        <MlvBreadcrumb>
          <MlvButton>
            <a href="#" target="_self">
              Item 1
            </a>
          </MlvButton>
          <MlvButton>
            <a href="#" target="_self">
              Item 2
            </a>
          </MlvButton>
          <MlvButton>
            <a href="#" target="_self">
              Item 3
            </a>
          </MlvButton>
          <span>You Are Here</span>
        </MlvBreadcrumb>

        <div nve-layout="row gap:xs align:wrap">
          <MlvButton>standard</MlvButton>
          <MlvButton interaction="emphasis">emphasis</MlvButton>
          <MlvButton interaction="destructive">destructive</MlvButton>
          <MlvButton disabled>disabled</MlvButton>
        </div>

        <MlvButtonGroup container="rounded" behavior-select="single">
          <MlvButton pressed>All Time</MlvButton>
          <MlvButton>30 Days</MlvButton>
          <MlvButton>90 Days</MlvButton>
        </MlvButtonGroup>

        <MlvCard nve-layout="full" style={{ height: '300px' }}>
          <MlvCardHeader>
            <h2 nve-text="heading">Title</h2>
          </MlvCardHeader>
          <MlvCardContent>Card Content</MlvCardContent>
        </MlvCard>

        <MlvInput>
          <label slot="label">input</label>
          <input type="text" />
        </MlvInput>
      </div>
    </>
  );
}

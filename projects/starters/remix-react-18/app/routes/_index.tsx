import React, {
  ComponentProps,
  ComponentType,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import {
  NveAccordionGroup,
  NveAccordion,
  NveAccordionHeader,
  NveAccordionContent
} from '@nvidia-elements/core-react/accordion';
import { NveAlert, NveAlertGroup } from '@nvidia-elements/core-react/alert';
import { NvePageHeader } from '@nvidia-elements/core-react/page-header';
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
import { NveTree, NveTreeNode } from '@nvidia-elements/core-react/tree';
import { NveSelect } from '@nvidia-elements/core-react/select';
import { NveInput, NveInputGroup } from '@nvidia-elements/core-react/input';
import { NveGrid, NveGridCell, NveGridColumn, NveGridHeader, NveGridRow } from '@nvidia-elements/core-react/grid';
import { NveCheckbox, NveCheckboxGroup } from '@nvidia-elements/core-react/checkbox';
import { NveControlMessage } from '@nvidia-elements/core-react/forms';
import { NveIcon } from '@nvidia-elements/core-react/icon';
import { Link, useRouteLoaderData } from '@remix-run/react';
import { NveTabs, NveTabsItem } from '@nvidia-elements/core-react/tabs';
import { NveDot } from '@nvidia-elements/core-react/dot';
import { loader } from '../root.js';
import { NvePage } from '@nvidia-elements/core-react/page';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// This demo is used for baseline experimental SSR support testing.
// This demo does not follow the same consistent pattern as the rest of the demo integrations.
export default function Home() {
  return (
    <NonSSRRerenderable name="Full Page" fullPage>
      <NonSSRRerenderable name="PageHeader">
        <NvePageHeader>
          <NveLogo slot="prefix" size="sm" />
          <h2 slot="prefix">Remix</h2>
          <NveButton selected container="flat">
            Link 1
          </NveButton>
          <NveButton container="flat">Link 2</NveButton>
          <NveIconButton icon-name="search" container="flat" slot="suffix"></NveIconButton>
          <NveIconButton icon-name="switch-apps" container="flat" slot="suffix"></NveIconButton>
          <NveIconButton interaction="emphasis" slot="suffix" size="sm">
            EL
          </NveIconButton>
        </NvePageHeader>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="AppHeader">
        <NveAppHeader>
          <NveLogo size="sm" />
          <h2 slot="title">Remix</h2>
          <NveButton slot="nav-items" container="flat">
            Link 1
          </NveButton>
          <NveButton slot="nav-items" container="flat" selected>
            Link 2
          </NveButton>
          <NveIconButton icon-name="search" container="flat" slot="nav-actions"></NveIconButton>
          <NveIconButton icon-name="switch-apps" container="flat" slot="nav-actions"></NveIconButton>
          <NveIconButton interaction="emphasis" slot="nav-actions" size="sm">
            EL
          </NveIconButton>
        </NveAppHeader>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Icon">
        <NveIcon name="person"></NveIcon>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Tabs">
        <NveTabs behaviorSelect>
          <NveTabsItem>Tab 1</NveTabsItem>
          <NveTabsItem>Tab 2</NveTabsItem>
          <NveTabsItem>Tab 3 </NveTabsItem>
          <NveTabsItem selected>
            Tab 4<NveDot aria-label="10 notifications">10</NveDot>
          </NveTabsItem>
          <NveTabsItem disabled>Disabled</NveTabsItem>
        </NveTabs>
      </NonSSRRerenderable>

      <PopoverExample name="Tooltip" Component={NveTooltip}>
        hello there
      </PopoverExample>

      <PopoverExample name="Toast" Component={NveToast}>
        copied!
      </PopoverExample>

      <PopoverExample name="Drawer" Component={NveDrawer} closable modal excludeShown>
        <NveDrawerHeader>
          <h3 nve-text="heading semibold sm">Title</h3>
        </NveDrawerHeader>
        <p nve-text="body">some text content in a drawer</p>
      </PopoverExample>

      <PopoverExample name="Dropdown" Component={NveDropdown} closable>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a dropdown</p>
      </PopoverExample>

      <PopoverExample name="Dialog" Component={NveDialog} closable modal excludeShown>
        <h3 nve-text="heading">Title</h3>
        <p nve-text="body">some text content in a closable dialog</p>
      </PopoverExample>

      <PopoverExample
        name="Notification"
        Component={NveNotification}
        closable
        position="bottom"
        alignment="end"
        close-timeout="2000"
        excludeShown>
        <h3 nve-text="label">notification</h3>
        <p nve-text="body">some text content in a notification</p>
      </PopoverExample>

      <NonSSRRerenderable name="Alert">
        <NveAlert status="success">hello there</NveAlert>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Alert Group">
        <NveAlertGroup status="accent">
          <NveAlert>
            Standard{' '}
            <NveButton slot="actions" container="flat">
              action
            </NveButton>
          </NveAlert>
        </NveAlertGroup>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Accordion Group">
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
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Badge">
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
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Breadcrumb">
        <NveBreadcrumb>
          <NveButton container="inline">
            <a href="#" target="_self">
              Item 1
            </a>
          </NveButton>
          <NveButton container="inline">
            <a href="#" target="_self">
              Item 2
            </a>
          </NveButton>
          <NveButton container="inline">
            <a href="#" target="_self">
              Item 3
            </a>
          </NveButton>
          <span>You Are Here</span>
        </NveBreadcrumb>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Button">
        <div nve-layout="row gap:xs align:wrap">
          <NveButton>standard</NveButton>
          <NveButton interaction="emphasis">emphasis</NveButton>
          <NveButton interaction="destructive">destructive</NveButton>
          <NveButton disabled>disabled</NveButton>
        </div>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Button Group">
        <NveButtonGroup container="rounded" behavior-select="single">
          <NveButton pressed>All Time</NveButton>
          <NveButton>30 Days</NveButton>
          <NveButton>90 Days</NveButton>
        </NveButtonGroup>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Card">
        <NveCard nve-layout="full" style={{ height: '300px' }}>
          <NveCardHeader>
            <h2 nve-text="heading">Title</h2>
          </NveCardHeader>
          <NveCardContent>Card Content</NveCardContent>
        </NveCard>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Tree">
        <NveTree behaviorExpand>
          <NveTreeNode expanded>
            Node 1<NveTreeNode>Node 1-1</NveTreeNode>
            <NveTreeNode>Node 1-2</NveTreeNode>
          </NveTreeNode>
          <NveTreeNode>
            Node 2<NveTreeNode>Node 2-1</NveTreeNode>
            <NveTreeNode>Node 2-2</NveTreeNode>
          </NveTreeNode>
        </NveTree>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Grid">
        <NveGrid>
          <NveGridHeader>
            <NveGridColumn>column 1</NveGridColumn>
            <NveGridColumn>column 2</NveGridColumn>
            <NveGridColumn>column 3</NveGridColumn>
            <NveGridColumn>column 4</NveGridColumn>
          </NveGridHeader>
          <NveGridRow>
            <NveGridCell>cell 1-1</NveGridCell>
            <NveGridCell>cell 1-2</NveGridCell>
            <NveGridCell>cell 1-3</NveGridCell>
            <NveGridCell>cell 1-4</NveGridCell>
          </NveGridRow>
          <NveGridRow>
            <NveGridCell>cell 2-1</NveGridCell>
            <NveGridCell>cell 2-2</NveGridCell>
            <NveGridCell>cell 2-3</NveGridCell>
            <NveGridCell>cell 2-4</NveGridCell>
          </NveGridRow>
        </NveGrid>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Checkbox">
        <NveCheckboxGroup>
          <label suppressHydrationWarning>checkbox group</label>
          <NveCheckbox>
            <label slot="label" suppressHydrationWarning>
              checkbox 1
            </label>
            <input id="checkbox-1" type="checkbox" defaultChecked />
          </NveCheckbox>
          <NveCheckbox>
            <label slot="label" htmlFor="checkbox-2">
              checkbox 2
            </label>
            <input id="checkbox-2" type="checkbox" defaultChecked />
          </NveCheckbox>
          <NveCheckbox>
            <label slot="label" htmlFor="checkbox-3">
              checkbox 3
            </label>
            <input id="checkbox-3" type="checkbox" defaultChecked />
          </NveCheckbox>
          <NveControlMessage>message</NveControlMessage>
        </NveCheckboxGroup>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Input Group">
        <NveInputGroup>
          <label>domain</label>
          <NveSelect style={{ width: '130px' }}>
            <select aria-label="protocol">
              <option>https://</option>
              <option>http://</option>
            </select>
          </NveSelect>
          <NveInput>
            <input placeholder="example" type="url" aria-label="host" />
            <NveButton container="flat" readonly>
              .com
            </NveButton>
          </NveInput>
          <NveControlMessage>host: 123456</NveControlMessage>
        </NveInputGroup>
      </NonSSRRerenderable>

      <NonSSRRerenderable name="Input">
        <NveInput>
          <label>my label</label>
          <input placeholder="my placeholder" type="text" />
        </NveInput>
      </NonSSRRerenderable>
    </NonSSRRerenderable>
  );
}

function PopoverExample<
  T extends ComponentType<{
    id?: string;
    anchor?: string | HTMLElement;
    trigger?: string | HTMLElement;
    children: ReactNode;
  }>
>({
  name,
  Component,
  excludeShown = false,
  ...props
}: {
  name: string;
  excludeShown?: boolean;
  Component: T;
} & ComponentProps<T>) {
  const id = useId();
  return (
    <NonSSRRerenderable name={name}>
      <div nve-layout="row gap:xs">
        {/* @ts-ignore */}
        <Component {...props} id={`${id}-popover`} />
        <NveButton popovertarget={`${id}-popover`}>popover api</NveButton>

        {/* @ts-ignore */}
        <Component {...props} anchor={`${id}-legacy-hidden`} trigger={`${id}-legacy-hidden`} behaviorTrigger hidden />
        <NveButton id={`${id}-legacy-hidden`}>legacy api hidden</NveButton>

        {excludeShown ? null : (
          <>
            {/* @ts-ignore */}
            <Component {...props} anchor={`${id}-legacy-shown`} trigger={`${id}-legacy-shown`} behaviorTrigger />
            <NveButton id={`${id}-legacy-shown`}>legacy api shown</NveButton>
          </>
        )}
      </div>
    </NonSSRRerenderable>
  );
}

function NonSSRRerenderable({
  name,
  children,
  fullPage = false,
  ...props
}: { name: string; fullPage?: boolean } & ComponentProps<typeof NveCardContent>) {
  const data = useRouteLoaderData<typeof loader>('root');
  const [reRenderCount, incrementReRenderCount] = useReducer(x => x + 1, 0);
  const [wasSsr, setWasSsr] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const combinedReRenderCount = reRenderCount + useParentReRenderCount();

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    const hasSsrError = ref.current.querySelectorAll('[data-ssr-source=client]').length > 0;
    if (hasSsrError) {
      setWasSsr(false);
    }
  }, []);

  return (
    <ParentReRenderCountProvider.Provider value={combinedReRenderCount}>
      <NveCard container="flat">
        <NveCardHeader>
          <h1 slot="title" nve-layout="row gap:md align:center">
            {name}
            <RenderSource ssr={wasSsr} rerendered={combinedReRenderCount > 0} />
          </h1>
          <div slot="header-action" nve-layout="row gap:md">
            <NveButton
              type="button"
              onClick={incrementReRenderCount}
              slot="header-action"
              style={{ marginLeft: '1em', visibility: combinedReRenderCount === 0 ? 'visible' : 'hidden' }}>
              Client-side Re-Render
            </NveButton>
            {fullPage ? (
              data?.disableJs ? (
                <Link to="/" reloadDocument>
                  <NveButton type="submit" interaction="emphasis">
                    Enable JS
                  </NveButton>
                </Link>
              ) : (
                <Link to="/?disable-js=true" reloadDocument>
                  <NveButton type="submit" interaction="destructive">
                    Disable JS
                  </NveButton>
                </Link>
              )
            ) : null}
          </div>
        </NveCardHeader>
        <NveCardContent {...props}>
          <div key={combinedReRenderCount} ref={ref} nve-layout={fullPage ? 'grid gap:md span-items:4' : ''}>
            {children}
          </div>
        </NveCardContent>
      </NveCard>
    </ParentReRenderCountProvider.Provider>
  );
}

function RenderSource({ ssr, rerendered }: { ssr: boolean; rerendered: boolean }) {
  return (
    <NveBadge status={ssr ? 'success' : 'danger'}>
      {ssr && !rerendered ? 'SSR' : !ssr ? 'Contains SSR Fallback' : 'Client'}
    </NveBadge>
  );
}

const ParentReRenderCountProvider = createContext(0);

function useParentReRenderCount() {
  return useContext(ParentReRenderCountProvider);
}

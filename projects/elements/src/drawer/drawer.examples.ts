import { html } from 'lit';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/drawer/define.js';

export default {
  title: 'Elements/Drawer',
  component: 'nve-drawer',
  inline: false
};

/* eslint-disable @nvidia-elements/lint/no-missing-popover-trigger */

/**
 * @summary Basic modal drawer with header, content, and footer sections. Use for displaying detailed information, forms, or settings that need more space than a dialog, typically sliding in from the side of the screen.
 */
export const Default = {
  render: () => html`
<nve-drawer id="drawer" closable modal>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
<nve-button popovertarget="drawer">button</nve-button>
  `,
};

/**
 * @summary Complete drawer layout pattern with header, scrollable content, and footer sections for consistent drawer structure.
 * @tags test-case
 */
export const Visual = {
  render: () => html`
<nve-drawer closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `,
};

/**
 * @summary Drawer with scrollable content for overflow behavior. Use when drawer content exceeds viewport height, ensuring header and footer remain fixed while content scrolls independently.
 * @tags test-case
 */
export const Scroll = {
  render: () => html`
<nve-drawer closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body" style="height: 2500px">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `,
};

/**
 * @summary Event handling for drawer open, close, and toggle events. Useful for adding custom behavior when drawer state changes.
 * @tags test-case
 */
export const Events = {
  render: () => html`
<nve-drawer id="drawer" closable modal position="right">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
</nve-drawer>
<nve-button popovertarget="drawer">open</nve-button>
<script type="module">
  const drawer = document.querySelector('nve-drawer');
  drawer.addEventListener('beforetoggle', () => console.log('beforetoggle'));
  drawer.addEventListener('toggle', () => console.log('toggle'));
  drawer.addEventListener('open', () => console.log('open'));
  drawer.addEventListener('close', () => console.log('close'));
</script>
  `
};

/**
 * @summary Small drawer size for compact side panels and quick actions. Ideal for navigation menus, filters, or supplementary information that shouldn't dominate the screen.
 * @tags test-case
 */
export const Small = {
  render: () => html`
<nve-drawer size="sm" closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `
};

/**
 * @summary Large drawer size for comprehensive content like detailed forms or settings panels. Use when users need significant screen space for complex tasks without leaving the current page context.
 * @tags test-case
 */
export const Large = {
  render: () => html`
<nve-drawer size="lg" closable>
  <nve-drawer-header>
    <h3 nve-text="heading semibold sm">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `
};

/**
 * @summary Non-closable drawer requiring explicit user action to close. Use for critical workflows or multi-step processes where users must complete or explicitly cancel actions, preventing accidental dismissal.
 * @tags test-case
 */
export const NonClosable = {
  render: () => html`
<nve-button id="open-btn">open</nve-button>
<nve-drawer hidden modal>
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
<script type="module">
  const drawer = document.querySelector('nve-drawer');
  const open = document.querySelector('#open-btn');
  const cancel = document.querySelector('#cancel-btn');
  open.addEventListener('click', () => drawer.hidden = false);
  cancel.addEventListener('click', () => drawer.hidden = true);
</script>
  `
};

/**
 * @summary Drawer positioning from all four screen edges. Use position based on content type and user workflow: right for details/settings, left for navigation, top/bottom for notifications or quick actions that span the width.
 * @tags test-case
 */
export const Position = {
  inline: false,
  render: () => html`
<div nve-layout="row align:center gap:md">
  <nve-button popovertarget="popover-top">open top</nve-button>
  <nve-button popovertarget="popover-left">open left</nve-button>
  <nve-button popovertarget="popover-right">open right</nve-button>
  <nve-button popovertarget="popover-bottom">open bottom</nve-button>
</div>

<nve-drawer id="popover-top" closable modal position="top">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Top</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body" style="height: 200px">some text content in a top closable drawer</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">some text footer content</p>
  </nve-drawer-footer>
</nve-drawer>

<nve-drawer id="popover-left" closable modal position="left">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Left</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>

<nve-drawer id="popover-right" closable modal position="right">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Right</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">some text content in a right closable drawer</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">some text footer content</p>
  </nve-drawer-footer>
</nve-drawer>

<nve-drawer id="popover-bottom" closable modal position="bottom">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Bottom</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body" style="height: 200px">some text content in a bottom closable drawer</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">some text footer content</p>
  </nve-drawer-footer>
</nve-drawer>
  `
};

/**
 * @summary Legacy drawer positioning with manual visibility management. Uses an older pattern with programmatic position control and event handling for backward compatibility.
 * @tags test-case
 */
export const LegacyPosition = {
  inline: false,
  render: () => html`
<div nve-layout="row align:center gap:md" style="height: 95vh">
  <nve-button class="drawer-btn-left">open left</nve-button>
  <nve-button class="drawer-btn-right">open right</nve-button>
  <nve-button class="drawer-btn-bottom">open bottom</nve-button>
</div>

<nve-drawer closable modal hidden position="left">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Left</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>

<nve-drawer closable modal hidden position="right">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Right</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">some text content in a right closable drawer</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">some text footer content</p>
  </nve-drawer-footer>
</nve-drawer>

<nve-drawer closable modal hidden position="bottom">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header Bottom</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">some text content in a bottom closable drawer</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">some text footer content</p>
  </nve-drawer-footer>
</nve-drawer>
<script type="module">
  const leftDrawer = document.querySelector('nve-drawer[position="left"]');
  document.querySelector('.drawer-btn-left').addEventListener('click', () => {
    leftDrawer.position = 'left';
    leftDrawer.hidden = false;
  });

  const rightDrawer = document.querySelector('nve-drawer[position="right"]');
  document.querySelector('.drawer-btn-right').addEventListener('click', () => {
    rightDrawer.position = 'right';
    rightDrawer.hidden = false;
  });

  const bottomDrawer = document.querySelector('nve-drawer[position="bottom"]');
  document.querySelector('.drawer-btn-bottom').addEventListener('click', () => {
    bottomDrawer.position = 'bottom';
    bottomDrawer.hidden = false;
  });

  leftDrawer.addEventListener('close', () => leftDrawer.hidden = true);
  rightDrawer.addEventListener('close', () => rightDrawer.hidden = true);
  bottomDrawer.addEventListener('close', () => bottomDrawer.hidden = true);
</script>
  `
};


/**
 * @summary Inline drawer constrained within a parent container rather than full viewport. Perfect for detail panels within cards or sections, maintaining context without overlaying the entire application.
 * @tags test-case
 */
export const Inline = {
  render: () => html`
<div nve-layout="row align:horizontal-stretch">
  <div nve-layout="column gap:md align:stretch">
    <nve-card style="height: 200px">
      <nve-card-content>
        <nve-button popovertarget="drawer">inline drawer</nve-button>
      </nve-card-content>
    </nve-card>
    <nve-card style="height: 200px"></nve-card>
  </div>

  <nve-drawer id="drawer" closable modal inline position="right">
    <nve-drawer-header>
      <h3 nve-text="heading semibold sm">Drawer Header</h3>
    </nve-drawer-header>
    <nve-drawer-content>
      <p nve-text="body">drawer content</p>
    </nve-drawer-content>
    <nve-drawer-footer>
      <p nve-text="body">drawer footer</p>
    </nve-drawer-footer>
  </nve-drawer>
</div>
  `
};

/**
 * @summary Inline drawer in persistent open state for always-visible side panels. Use for navigation, filters, or contextual information that should remain accessible while users interact with main content.
 * @tags test-case
 */
export const InlineVisible = {
  render: () => html`
<div nve-layout="row align:horizontal-stretch">
  <div nve-layout="column gap:md align:stretch">
    <nve-card style="height: 200px">
      <nve-card-content>
        open inline drawer
      </nve-card-content>
    </nve-card>
    <nve-card style="height: 200px"></nve-card>
  </div>

  <nve-drawer id="drawer" inline position="right">
    <nve-drawer-header>
      <h3 nve-text="heading semibold sm">Drawer Header</h3>
    </nve-drawer-header>
    <nve-drawer-content>
      <p nve-text="body">drawer content</p>
    </nve-drawer-content>
    <nve-drawer-footer>
      <p nve-text="body">drawer footer</p>
    </nve-drawer-footer>
  </nve-drawer>
</div>
  `
};

/**
 * @summary Legacy inline drawer pattern with manual visibility control. Uses an older implementation for inline drawer management; prefer the modern popovertarget API for new implementations.
 * @tags test-case
 */
export const LegacyInline = {
  render: () => html`
<div nve-layout="row align:stretch">
  <div nve-layout="column gap:md align:horizontal-stretch">
    <nve-card style="height: 200px">
      <nve-card-content>
        <nve-button>open inline drawer</nve-button>
      </nve-card-content>
    </nve-card>
    <nve-card style="height: 200px"></nve-card>
  </div>

  <nve-drawer hidden closable modal inline position="right">
    <nve-drawer-header>
      <h3 nve-text="heading semibold sm">Drawer Header</h3>
    </nve-drawer-header>
    <nve-drawer-content>
      <p nve-text="body">drawer content</p>
    </nve-drawer-content>
    <nve-drawer-footer>
      <p nve-text="body">drawer footer</p>
    </nve-drawer-footer>
  </nve-drawer>
</div>
<script type="module">
  const drawer = document.querySelector('nve-drawer');
  const open = document.querySelector('nve-button');
  open.addEventListener('click', () => drawer.hidden = false);
  drawer.addEventListener('close', () => drawer.hidden = true);
</script>
  `
};

/* eslint-disable @nvidia-elements/lint/no-deprecated-popover-attributes */

/**
 * @summary Legacy behavior-trigger pattern for automatic drawer lifecycle management. Deprecated approach that auto-manages visibility and state, prefer modern popovertarget API for new implementations.
 * @tags test-case
 */
export const LegacyBehaviorTrigger = {
  render: () => html`
<nve-button id="drawer-btn">open</nve-button>
<nve-drawer behavior-trigger trigger="drawer-btn" closable modal hidden position="right">
  <nve-drawer-header>
    <h3 nve-text="heading">Drawer Header</h3>
  </nve-drawer-header>
  <nve-drawer-content>
    <p nve-text="body">drawer content</p>
  </nve-drawer-content>
  <nve-drawer-footer>
    <p nve-text="body">drawer footer</p>
  </nve-drawer-footer>
</nve-drawer>
  `
};

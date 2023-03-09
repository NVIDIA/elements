import { html } from 'lit';
import '@elements/elements/card/define.js';

export default {
  title: 'Foundations/Tokens/Examples'
};

const menuDemoStyles = html`
<!-- demo html/css -->
<style>
  .interaction-demo {
    display: flex;
    gap: 12px;
    margin: 24px 0;
  }
  
  [nve-theme*=root].interaction-demo {
    padding: 6px !important;
  }

  .nve-dropdown {
    --background: var(--nve-sys-layer-overlay-background);
    --nve-sys-interaction-background: var(--nve-sys-layer-overlay-background);
    background: var(--background);
    box-shadow: var(--nve-ref-shadow-200);
    border-radius: var(--nve-ref-border-radius-md);
    padding: var(--nve-ref-size-200);
    gap: var(--nve-ref-size-200);
    width: 200px;
    display: flex;
    flex-direction: column;
  }
  
  .nve-drawer {
    background: var(--nve-sys-layer-container-background);
    box-shadow: var(--nve-ref-shadow-200);
    border-radius: var(--nve-ref-border-radius-md);
    padding: var(--nve-ref-size-200);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 320px;
    width: 200px;
  }

  .nve-menu {
    display: flex;
    flex-direction: column;
    max-width: 200px;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .nve-menu-item {
    width: 100%;
    display: block;
    border: 0;
    cursor: pointer;
    text-align: left;
    padding: var(--nve-ref-size-200) var(--nve-ref-size-300);
    color: var(--nve-sys-interaction-color);
    font-size: var(--nve-ref-font-size-300);
    border-radius: var(--nve-ref-border-radius-xs);
    background-image: linear-gradient(color-mix(in oklab, var(--nve-sys-interaction-state-base) 100%, var(--nve-sys-interaction-state-mix) var(--nve-sys-interaction-state-ratio)) 0 0) !important;
  }

  .nve-menu-item:hover,
  .nve-menu-item[hover] {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-hover);
  }

  .nve-menu-item:active,
  .nve-menu-item[active] {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-active);
  }

  .nve-menu-item[selected] {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-selected);
  }

  .nve-menu-item[disabled] {
    --nve-sys-interaction-state-ratio: var(--nve-sys-interaction-state-ratio-disabled);
    cursor: not-allowed;
  }

  .nve-menu-item[readonly] {
    --nve-sys-interaction-state-ratio: 0;
  }

  .nve-menu-item:focus,
  .nve-menu-item[focused] {
    outline-offset: -3px;
    outline: 5px auto -webkit-focus-ring-color;
    outline: Highlight solid 2px;
  }
</style>
`;

export const Menu = {
  render: () => html`
    ${menuDemoStyles}
    <section nve-theme="root light" class="interaction-demo">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item">default</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" hover>hover</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" active>active</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" selected>selected</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" disabled>disabled</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" focused>focused</div>
        <div class="nve-menu-item">item</div>
      </div>
    </section>
    <section nve-theme="root dark" class="interaction-demo">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item">default</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" hover>hover</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" active>active</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" selected>selected</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" disabled>disabled</div>
        <div class="nve-menu-item">item</div>
      </div>
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" focused>focused</div>
        <div class="nve-menu-item">item</div>
      </div>
    </section>
  `
};

export const ContainerMenu = {
  render: () => html`
    <div nve-layout="grid span-items:6 gap:md">
      <div nve-theme="root light" nve-layout="pad:md align:stretch">
        <nve-card>
          <nve-card-content nve-layout="grid gap:md">
            <div nve-layout="span:5 column gap:xs">
              <div class="nve-menu-item">default</div>
              <div class="nve-menu-item" hover>hover</div>
              <div class="nve-menu-item" active>active</div>
              <div class="nve-menu-item" selected>selected</div>
              <div class="nve-menu-item" disabled>disabled</div>
              <div class="nve-menu-item" focused>focused</div>
            </div>
            <div nve-layout="span:7">container</div>
          </nve-card-content>
        </nve-card>
      </div>
      <div nve-theme="root dark" nve-layout="pad:md align:stretch">
        <nve-card>
          <nve-card-content nve-layout="grid gap:md">
            <div nve-layout="span:5 column gap:xs">
              <div class="nve-menu-item">default</div>
              <div class="nve-menu-item" hover>hover</div>
              <div class="nve-menu-item" active>active</div>
              <div class="nve-menu-item" selected>selected</div>
              <div class="nve-menu-item" disabled>disabled</div>
              <div class="nve-menu-item" focused>focused</div>
            </div>
            <div nve-layout="span:7">container</div>
          </nve-card-content>
        </nve-card>
      </div>
    </div>
  `
}

export const PopoverMenu = {
  render: () => html`
    ${menuDemoStyles}
    <section nve-theme="root light" class="interaction-demo">
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item">default</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" hover>hover</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" active>active</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" selected>selected</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" disabled>disabled</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" focused>focused</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
    </section>
    <section nve-theme="root dark" class="interaction-demo">
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item">default</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" hover>hover</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" active>active</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" selected>selected</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" disabled>disabled</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
      <div class="nve-dropdown">
        <div class="nve-menu">
          <div class="nve-menu-item">item</div>
          <div class="nve-menu-item" focused>focused</div>
          <div class="nve-menu-item">item</div>
        </div>
      </div>
    </section>
  `
}

export const NavigationDrawer = {
  render: () => html`
  ${menuDemoStyles}
  <section nve-theme="root light" class="interaction-demo">
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item">default</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" hover>hover</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" active>active</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" selected>selected</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" disabled>disabled</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" focused>focused</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
  </section>
  <section nve-theme="root dark" class="interaction-demo">
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item">default</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" hover>hover</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" active>active</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" selected>selected</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" disabled>disabled</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
    <div class="nve-drawer">
      <div class="nve-menu">
        <div class="nve-menu-item">item</div>
        <div class="nve-menu-item" focused>focused</div>
        <div class="nve-menu-item">item</div>
      </div>
    </div>
  </section>
`
}

export const Tabs = {
  render: () => html`
    <style>
      .interaction-demo-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 48px 12px;
        margin: 24px 0;
        padding: 6px;
      }

      .nve-tab {
        width: fit-content;
        display: inline-flex;
        align-items: center;
        border: 0;
        cursor: pointer;
        background: transparent;
        padding: 0 var(--nve-ref-size-300);
        height: var(--nve-ref-size-800);
        color: var(--nve-sys-interaction-color);
        font-size: var(--nve-ref-font-size-300);
        border-bottom: var(--nve-ref-border-width-lg) solid transparent;
      }

      .nve-tabs > p {
        padding: var(--nve-ref-size-200) var(--nve-ref-size-300);
        margin: 0;
      }

      .nve-tab:is([selected], [hover], :hover) {
        border-bottom: var(--nve-ref-border-width-lg) solid var(--nve-sys-accent-secondary-background);
      }

      .nve-tab[disabled] {
        cursor: not-allowed;
        border-bottom: var(--nve-ref-border-width-lg) solid var(--nve-ref-border-color-muted);
      }

      .nve-tab:focus,
      .nve-tab[focused] {
        outline-offset: -3px;
        outline: 5px auto -webkit-focus-ring-color; /* var(--nve-ref-outline-webkit) */
        outline: Highlight solid 2px; /* --nve-ref-outline */
      }
    </style>
    <section nve-theme="root light" class="interaction-demo-tabs">
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab">item</div>
        <div class="nve-tab">item</div>
        <p>default</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" hover>item</div>
        <div class="nve-tab">item</div>
        <p>hover</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" active>item</div>
        <div class="nve-tab">item</div>
        <p>active</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" selected>item</div>
        <div class="nve-tab">item</div>
        <p>selected</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" disabled>item</div>
        <div class="nve-tab">item</div>
        <p>disabled</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" focused>item</div>
        <div class="nve-tab">item</div>
        <p>focused</p>
      </div>
    </section>
    <section nve-theme="root dark" class="interaction-demo-tabs">
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab">item</div>
        <div class="nve-tab">item</div>
        <p>default</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" hover>item</div>
        <div class="nve-tab">item</div>
        <p>hover</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" active>item</div>
        <div class="nve-tab">item</div>
        <p>active</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" selected>item</div>
        <div class="nve-tab">item</div>
        <p>selected</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" disabled>item</div>
        <div class="nve-tab">item</div>
        <p>disabled</p>
      </div>
      <div class="nve-tabs">
        <div class="nve-tab">item</div>
        <div class="nve-tab" focused>item</div>
        <div class="nve-tab">item</div>
        <p>focused</p>
      </div>
    </section>
  `
};
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
  
  [mlv-theme*=root].interaction-demo {
    padding: 6px !important;
  }

  .mlv-dropdown {
    --background: var(--mlv-sys-layer-overlay-background);
    --mlv-sys-interaction-background: var(--mlv-sys-layer-overlay-background);
    background: var(--background);
    box-shadow: var(--mlv-ref-shadow-200);
    border-radius: var(--mlv-ref-border-radius-md);
    padding: var(--mlv-ref-size-200);
    gap: var(--mlv-ref-size-200);
    width: 200px;
    display: flex;
    flex-direction: column;
  }
  
  .mlv-drawer {
    background: var(--mlv-sys-layer-container-background);
    box-shadow: var(--mlv-ref-shadow-200);
    border-radius: var(--mlv-ref-border-radius-md);
    padding: var(--mlv-ref-size-200);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 320px;
    width: 200px;
  }

  .mlv-menu {
    display: flex;
    flex-direction: column;
    max-width: 200px;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .mlv-menu-item {
    width: 100%;
    display: block;
    border: 0;
    cursor: pointer;
    text-align: left;
    padding: var(--mlv-ref-size-200) var(--mlv-ref-size-300);
    color: var(--mlv-sys-interaction-color);
    font-size: var(--mlv-ref-font-size-300);
    border-radius: var(--mlv-ref-border-radius-xs);
    background-image: linear-gradient(color-mix(in oklab, var(--mlv-sys-interaction-state-base) 100%, var(--mlv-sys-interaction-state-mix) var(--mlv-sys-interaction-state-ratio)) 0 0) !important;
  }

  .mlv-menu-item:hover,
  .mlv-menu-item[hover] {
    --mlv-sys-interaction-state-ratio: var(--mlv-sys-interaction-state-ratio-hover);
  }

  .mlv-menu-item:active,
  .mlv-menu-item[active] {
    --mlv-sys-interaction-state-ratio: var(--mlv-sys-interaction-state-ratio-active);
  }

  .mlv-menu-item[selected] {
    --mlv-sys-interaction-state-ratio: var(--mlv-sys-interaction-state-ratio-selected);
  }

  .mlv-menu-item[disabled] {
    --mlv-sys-interaction-state-ratio: var(--mlv-sys-interaction-state-ratio-disabled);
    cursor: not-allowed;
  }

  .mlv-menu-item[readonly] {
    --mlv-sys-interaction-state-ratio: 0;
  }

  .mlv-menu-item:focus,
  .mlv-menu-item[focused] {
    outline-offset: -3px;
    outline: 5px auto -webkit-focus-ring-color;
    outline: Highlight solid 2px;
  }
</style>
`;

export const Menu = {
  render: () => html`
    ${menuDemoStyles}
    <section mlv-theme="root light" class="interaction-demo">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item">default</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" hover>hover</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" active>active</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" selected>selected</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" disabled>disabled</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" focused>focused</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </section>
    <section mlv-theme="root dark" class="interaction-demo">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item">default</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" hover>hover</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" active>active</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" selected>selected</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" disabled>disabled</div>
        <div class="mlv-menu-item">item</div>
      </div>
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" focused>focused</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </section>
  `
};

export const ContainerMenu = {
  render: () => html`
    <div mlv-layout="grid span-items:6 gap:md">
      <div mlv-theme="root light" mlv-layout="pad:md align:stretch">
        <mlv-card>
          <mlv-card-content mlv-layout="grid gap:md">
            <div mlv-layout="span:5 column gap:xs">
              <div class="mlv-menu-item">default</div>
              <div class="mlv-menu-item" hover>hover</div>
              <div class="mlv-menu-item" active>active</div>
              <div class="mlv-menu-item" selected>selected</div>
              <div class="mlv-menu-item" disabled>disabled</div>
              <div class="mlv-menu-item" focused>focused</div>
            </div>
            <div mlv-layout="span:7">container</div>
          </mlv-card-content>
        </mlv-card>
      </div>
      <div mlv-theme="root dark" mlv-layout="pad:md align:stretch">
        <mlv-card>
          <mlv-card-content mlv-layout="grid gap:md">
            <div mlv-layout="span:5 column gap:xs">
              <div class="mlv-menu-item">default</div>
              <div class="mlv-menu-item" hover>hover</div>
              <div class="mlv-menu-item" active>active</div>
              <div class="mlv-menu-item" selected>selected</div>
              <div class="mlv-menu-item" disabled>disabled</div>
              <div class="mlv-menu-item" focused>focused</div>
            </div>
            <div mlv-layout="span:7">container</div>
          </mlv-card-content>
        </mlv-card>
      </div>
    </div>
  `
}

export const PopoverMenu = {
  render: () => html`
    ${menuDemoStyles}
    <section mlv-theme="root light" class="interaction-demo">
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item">default</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" hover>hover</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" active>active</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" selected>selected</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" disabled>disabled</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" focused>focused</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
    </section>
    <section mlv-theme="root dark" class="interaction-demo">
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item">default</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" hover>hover</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" active>active</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" selected>selected</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" disabled>disabled</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
      <div class="mlv-dropdown">
        <div class="mlv-menu">
          <div class="mlv-menu-item">item</div>
          <div class="mlv-menu-item" focused>focused</div>
          <div class="mlv-menu-item">item</div>
        </div>
      </div>
    </section>
  `
}

export const NavigationDrawer = {
  render: () => html`
  ${menuDemoStyles}
  <section mlv-theme="root light" class="interaction-demo">
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item">default</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" hover>hover</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" active>active</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" selected>selected</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" disabled>disabled</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" focused>focused</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
  </section>
  <section mlv-theme="root dark" class="interaction-demo">
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item">default</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" hover>hover</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" active>active</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" selected>selected</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" disabled>disabled</div>
        <div class="mlv-menu-item">item</div>
      </div>
    </div>
    <div class="mlv-drawer">
      <div class="mlv-menu">
        <div class="mlv-menu-item">item</div>
        <div class="mlv-menu-item" focused>focused</div>
        <div class="mlv-menu-item">item</div>
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

      .mlv-tab {
        width: fit-content;
        display: inline-flex;
        align-items: center;
        border: 0;
        cursor: pointer;
        background: transparent;
        padding: 0 var(--mlv-ref-size-300);
        height: var(--mlv-ref-size-800);
        color: var(--mlv-sys-interaction-color);
        font-size: var(--mlv-ref-font-size-300);
        border-bottom: var(--mlv-ref-border-width-lg) solid transparent;
      }

      .mlv-tabs > p {
        padding: var(--mlv-ref-size-200) var(--mlv-ref-size-300);
        margin: 0;
      }

      .mlv-tab:is([selected], [hover], :hover) {
        border-bottom: var(--mlv-ref-border-width-lg) solid var(--mlv-sys-accent-secondary-background);
      }

      .mlv-tab[disabled] {
        cursor: not-allowed;
        border-bottom: var(--mlv-ref-border-width-lg) solid var(--mlv-ref-border-color-muted);
      }

      .mlv-tab:focus,
      .mlv-tab[focused] {
        outline-offset: -3px;
        outline: 5px auto -webkit-focus-ring-color; /* var(--mlv-ref-outline-webkit) */
        outline: Highlight solid 2px; /* --mlv-ref-outline */
      }
    </style>
    <section mlv-theme="root light" class="interaction-demo-tabs">
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab">item</div>
        <div class="mlv-tab">item</div>
        <p>default</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" hover>item</div>
        <div class="mlv-tab">item</div>
        <p>hover</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" active>item</div>
        <div class="mlv-tab">item</div>
        <p>active</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" selected>item</div>
        <div class="mlv-tab">item</div>
        <p>selected</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" disabled>item</div>
        <div class="mlv-tab">item</div>
        <p>disabled</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" focused>item</div>
        <div class="mlv-tab">item</div>
        <p>focused</p>
      </div>
    </section>
    <section mlv-theme="root dark" class="interaction-demo-tabs">
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab">item</div>
        <div class="mlv-tab">item</div>
        <p>default</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" hover>item</div>
        <div class="mlv-tab">item</div>
        <p>hover</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" active>item</div>
        <div class="mlv-tab">item</div>
        <p>active</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" selected>item</div>
        <div class="mlv-tab">item</div>
        <p>selected</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" disabled>item</div>
        <div class="mlv-tab">item</div>
        <p>disabled</p>
      </div>
      <div class="mlv-tabs">
        <div class="mlv-tab">item</div>
        <div class="mlv-tab" focused>item</div>
        <div class="mlv-tab">item</div>
        <p>focused</p>
      </div>
    </section>
  `
};
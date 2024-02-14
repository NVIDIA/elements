import { html } from 'lit';
import '@elements/elements/badge/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/button-group/define.js';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/tabs/define.js';

export default {
  title: 'Patterns/Examples',
  component: 'patterns'
};

/* Main Page Headers */
export const StandardHeaderMainPage = {
  render: () => html`
    <mlv-card container="flat">
      <mlv-card-content mlv-layout="column gap:md align:stretch pad-x:xl">
        <!-- Breadcrumbs -->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <h1 mlv-text="heading lg semibold">Page Title</h1>

          <!-- Action Buttons -->
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-button>Default</mlv-button>
            <mlv-button interaction="emphasize">Emphasized</mlv-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </section>
        </div>
      </mlv-card-content>
    </mlv-card>
  `
}

export const TabsHeaderMainPage = {
  render: () => html`
    <mlv-card container="flat" style="--border-bottom: var(--mlv-ref-border-width-sm) solid var(--mlv-ref-border-color-muted)">
      <mlv-card-content style="--padding: 0" mlv-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!-- Breadcrumbs -->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <h1 mlv-text="heading lg semibold">Page Title</h1>

          <!-- Action Buttons -->
          <div mlv-layout="row gap:sm align:vertical-center">
            <mlv-button>Default</mlv-button>
            <mlv-button interaction="emphasize">Emphasized</mlv-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </div>
        </div>

        <!-- Tabs -->
        <mlv-tabs behavior-select>
          <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
          <mlv-tabs-item>Tab 2</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
          <mlv-tabs-item>Tab 4</mlv-tabs-item>
        </mlv-tabs>
      </mlv-card-content>
    </mlv-card>
  `
}

export const StackedMetadataHeaderMainPage = {
  render: () => html`
    <mlv-card container="flat">
      <mlv-card-content mlv-layout="column gap:md align:stretch pad-x:xl">
        <!-- Breadcrumbs -->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <h1 mlv-text="heading lg semibold">Page Title</h1>

          <!-- Action Buttons -->
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-button>Default</mlv-button>
            <mlv-button interaction="emphasize">Emphasized</mlv-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </section>
        </div>

        <!-- Metadata -->
        <section mlv-layout="row gap:xl align:vertical-center">
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Session ID</span>
            <a mlv-text="body sm bold link" href="#">13245768</a>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Driver</span>
            <span mlv-text="body sm bold">Jane Doe</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Co-Pilot</span>
            <span mlv-text="body sm bold">John Doe</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Route</span>
            <span mlv-text="body sm bold">Santa Clara</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Status</span>
            <span mlv-text="body sm bold"><mlv-badge status="success">complete</mlv-badge></span>
          </div>
        </section>
      </mlv-card-content>
    </mlv-card>
  `
}

export const InlineMetadataHeaderMainPage = {
  render: () => html`
    <mlv-card container="flat">
      <mlv-card-content mlv-layout="column gap:md align:stretch pad-x:xl">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <h1 mlv-text="heading lg semibold">Page Title</h1>

          <!-- Metadata -->
          <div mlv-layout="row gap:xl align:vertical-center">
            <section mlv-layout="row gap:xl align:vertical-center">
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Session ID</span>
                <a mlv-text="body sm bold link" href="#">13245768</a>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Driver</span>
                <span mlv-text="body sm bold">Jane Doe</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Co-Pilot</span>
                <span mlv-text="body sm bold">John Doe</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Route</span>
                <span mlv-text="body sm bold">Santa Clara</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Status</span>
                <span mlv-text="body sm bold"><mlv-badge status="success">complete</mlv-badge></span>
              </div>
            </section>

            <mlv-divider orientation="vertical"></mlv-divider>

            <!-- Action Buttons -->
            <section mlv-layout="row gap:sm align:vertical-center">
              <mlv-button>Default</mlv-button>
              <mlv-button interaction="emphasize">Emphasized</mlv-button>
              <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
            </section>
          </div>
        </div>
      </mlv-card-content>
    </mlv-card>
  `
}

export const InlineKitchenSinkHeaderMainPage = {
  render: () => html`
    <mlv-card container="flat" style="--border-bottom: var(--mlv-ref-border-width-sm) solid var(--mlv-ref-border-color-muted)">
      <mlv-card-content style="--padding: 0" mlv-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <mlv-button><a href="#" target="_self">Item 2</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
            <h1 mlv-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Metadata -->
          <div mlv-layout="row gap:xl align:vertical-center">
            <section mlv-layout="row gap:xl align:vertical-center">
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Session ID</span>
                <a mlv-text="body sm bold link" href="#">13245768</a>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Driver</span>
                <span mlv-text="body sm bold">Jane Doe</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Co-Pilot</span>
                <span mlv-text="body sm bold">John Doe</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Route</span>
                <span mlv-text="body sm bold">Santa Clara</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Status</span>
                <span mlv-text="body sm bold"><mlv-badge status="success">complete</mlv-badge></span>
              </div>
            </section>

            <!--Divider-->
            <mlv-divider orientation="vertical"></mlv-divider>

            <!-- Action Buttons -->
            <section mlv-layout="row gap:sm align:vertical-center">
              <mlv-button>Default</mlv-button>
              <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
            </section>
          </div>
        </div>

        <!--Tabs-->
        <mlv-tabs behavior-select>
          <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
          <mlv-tabs-item>Tab 2</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
          <mlv-tabs-item>Tab 4</mlv-tabs-item>
        </mlv-tabs>
      </mlv-card-content>
    </mlv-card>
  `
}

export const StackedKitchenSinkHeaderMainPage = {
  render: () => html`
    <mlv-card container="flat" style="--border-bottom: var(--mlv-ref-border-width-sm) solid var(--mlv-ref-border-color-muted)">
      <mlv-card-content style="--padding: 0" mlv-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <mlv-button><a href="#" target="_self">Item 2</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
            <h1 mlv-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-button>Default</mlv-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </section>
        </div>

        <!-- Metadata -->
        <section mlv-layout="row gap:xl align:vertical-center">
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Session ID</span>
            <a mlv-text="body sm bold link" href="#">13245768</a>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Driver</span>
            <span mlv-text="body sm bold">Jane Doe</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Co-Pilot</span>
            <span mlv-text="body sm bold">John Doe</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Route</span>
            <span mlv-text="body sm bold">Santa Clara</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Status</span>
            <span mlv-text="body sm bold"><mlv-badge status="success">complete</mlv-badge></span>
          </div>
        </section>

        <!--Tabs-->
        <mlv-tabs behavior-select>
          <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
          <mlv-tabs-item>Tab 2</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
          <mlv-tabs-item>Tab 4</mlv-tabs-item>
        </mlv-tabs>
      </mlv-card-content>
    </mlv-card>
  `
}



/* Detail Page Headers */
export const StandardHeaderDetailPage = {
  render: () => html`
    <mlv-card container="full">
      <mlv-card-content mlv-layout="column gap:md align:stretch pad-x:xl">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <mlv-button><a href="#" target="_self">Item 2</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
            <h1 mlv-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-button>Default</mlv-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </section>
        </div>
      </mlv-card-content>
    </mlv-card>
  `
}

export const TabsHeaderDetailPage = {
  render: () => html`
    <mlv-card container="full">
      <mlv-card-content style="--padding: 0" mlv-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <mlv-button><a href="#" target="_self">Item 2</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
            <h1 mlv-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <div mlv-layout="row gap:sm align:vertical-center">
            <mlv-button>Default</mlv-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </div>
        </div>

        <!--Tabs-->
        <mlv-tabs behavior-select>
          <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
          <mlv-tabs-item>Tab 2</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
          <mlv-tabs-item>Tab 4</mlv-tabs-item>
        </mlv-tabs>
      </mlv-card-content>
    </mlv-card>
  `
}

export const StackedMetadataHeaderDetailPage = {
  render: () => html`
    <mlv-card container="full">
      <mlv-card-content mlv-layout="column gap:md align:stretch pad-x:xl">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <mlv-button><a href="#" target="_self">Item 2</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
            <h1 mlv-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-button>Default</mlv-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </section>
        </div>

        <!-- Metadata -->
        <section mlv-layout="row gap:xl align:vertical-center">
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Session ID</span>
            <a mlv-text="body sm bold link" href="#">13245768</a>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Driver</span>
            <span mlv-text="body sm bold">Jane Doe</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Co-Pilot</span>
            <span mlv-text="body sm bold">John Doe</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Route</span>
            <span mlv-text="body sm bold">Santa Clara</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Status</span>
            <span mlv-text="body sm bold"><mlv-badge status="success">complete</mlv-badge></span>
          </div>
        </section>
      </mlv-card-content>
    </mlv-card>
  `
}

export const InlineMetadataHeaderDetailPage = {
  render: () => html`
    <mlv-card container="full">
      <mlv-card-content mlv-layout="column gap:md align:stretch pad-x:xl">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <mlv-button><a href="#" target="_self">Item 2</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
            <h1 mlv-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Metadata -->
          <div mlv-layout="row gap:xl align:vertical-center">
            <section mlv-layout="row gap:xl align:vertical-center">
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Session ID</span>
                <a mlv-text="body sm bold link" href="#">13245768</a>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Driver</span>
                <span mlv-text="body sm bold">Jane Doe</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Co-Pilot</span>
                <span mlv-text="body sm bold">John Doe</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Route</span>
                <span mlv-text="body sm bold">Santa Clara</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Status</span>
                <span mlv-text="body sm bold"><mlv-badge status="success">complete</mlv-badge></span>
              </div>
            </section>

            <!--Divider-->
            <mlv-divider orientation="vertical"></mlv-divider>

            <!-- Action Buttons -->
            <section mlv-layout="row gap:sm align:vertical-center">
              <mlv-button>Default</mlv-button>
              <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
            </section>
          </div>
        </div>
      </mlv-card-content>
    </mlv-card>
  `
}

export const InlineKitchenSinkHeaderDetailPage = {
  render: () => html`
    <mlv-card container="full">
      <mlv-card-content style="--padding: 0" mlv-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <mlv-button><a href="#" target="_self">Item 2</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
            <h1 mlv-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Metadata -->
          <div mlv-layout="row gap:xl align:vertical-center">
            <section mlv-layout="row gap:xl align:vertical-center">
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Session ID</span>
                <a mlv-text="body sm bold link" href="#">13245768</a>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Driver</span>
                <span mlv-text="body sm bold">Jane Doe</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Co-Pilot</span>
                <span mlv-text="body sm bold">John Doe</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Route</span>
                <span mlv-text="body sm bold">Santa Clara</span>
              </div>
              <div mlv-layout="column gap:sm align:left">
                <span mlv-text="body sm muted">Status</span>
                <span mlv-text="body sm bold"><mlv-badge status="success">complete</mlv-badge></span>
              </div>
            </section>

            <!--Divider-->
            <mlv-divider orientation="vertical"></mlv-divider>

            <!-- Action Buttons -->
            <section mlv-layout="row gap:sm align:vertical-center">
              <mlv-button>Default</mlv-button>
              <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
            </section>
          </div>
        </div>

        <!--Tabs-->
        <mlv-tabs behavior-select>
          <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
          <mlv-tabs-item>Tab 2</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
          <mlv-tabs-item>Tab 4</mlv-tabs-item>
        </mlv-tabs>
      </mlv-card-content>
    </mlv-card>
  `
}

export const StackedKitchenSinkHeaderDetailPage = {
  render: () => html`
    <mlv-card container="full">
      <mlv-card-content style="--padding: 0" mlv-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <mlv-breadcrumb>
          <mlv-button><a href="#" target="_self">Item 1</a></mlv-button>
          <mlv-button><a href="#" target="_self">Item 2</a></mlv-button>
          <span>You Are Here</span>
        </mlv-breadcrumb>

        <div mlv-layout="row align:space-between align:vertical-center">
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
            <h1 mlv-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <section mlv-layout="row gap:sm align:vertical-center">
            <mlv-button>Default</mlv-button>
            <mlv-icon-button icon-name="more-actions"></mlv-icon-button>
          </section>
        </div>

        <!-- Metadata -->
        <section mlv-layout="row gap:xl align:vertical-center">
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Session ID</span>
            <a mlv-text="body sm bold link" href="#">13245768</a>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Driver</span>
            <span mlv-text="body sm bold">Jane Doe</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Co-Pilot</span>
            <span mlv-text="body sm bold">John Doe</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Route</span>
            <span mlv-text="body sm bold">Santa Clara</span>
          </div>
          <div mlv-layout="row gap:sm align:center">
            <span mlv-text="body sm muted">Status</span>
            <span mlv-text="body sm bold"><mlv-badge status="success">complete</mlv-badge></span>
          </div>
        </section>

        <!--Tabs-->
        <mlv-tabs behavior-select>
          <mlv-tabs-item selected>Tab 1</mlv-tabs-item>
          <mlv-tabs-item>Tab 2</mlv-tabs-item>
          <mlv-tabs-item>Tab 3</mlv-tabs-item>
          <mlv-tabs-item>Tab 4</mlv-tabs-item>
        </mlv-tabs>
      </mlv-card-content>
    </mlv-card>
  `
}


/* Viewer Page Headers */
export const StandardHeaderViewerPage = {
  render: () => html`
    <mlv-card container="full" style="--border-bottom: 0">
      <mlv-card-content mlv-layout="row align:space-between align:vertical-center pad-x:xl">
        <section mlv-layout="row gap:sm align:vertical-center">
          <mlv-icon-button icon-name="arrow" direction="left" size="sm"></mlv-icon-button>
          <h1 mlv-text="heading xs semibold">Page Title</h1>
        </section>

        <!--Center Controls-->
        <section mlv-layout="row align:center align:vertical-center gap:xxxs">
          <mlv-select container="flat" style="--border-bottom: 0">
            <select>
              <option value="1">100%</option>
              <option value="2">75%</option>
              <option value="3">50%</option>
              <option value="4">25%</option>
            </select>
          </mlv-select>
          <mlv-button-group container="flat" behavior-select="single">
            <mlv-icon-button size="sm" pressed icon-name="view-as-grid"></mlv-icon-button>
            <mlv-icon-button size="sm" icon-name="split-vertical"></mlv-icon-button>
            <mlv-icon-button size="sm" icon-name="split-horizontal"></mlv-icon-button>
            <mlv-icon-button size="sm" icon-name="split-none"></mlv-icon-button>
          </mlv-button-group>
        </section>

        <!-- Action Buttons -->
        <mlv-button-group container="flat">
          <mlv-icon-button size="sm" icon-name="download"></mlv-icon-button>
          <mlv-icon-button size="sm" icon-name="refresh"></mlv-icon-button>
          <mlv-icon-button size="sm" icon-name="more-actions"></mlv-icon-button>
        </mlv-button-group>
      </mlv-card-content>
    </mlv-card>
  `
}


/* Toolbar Page Headers */
export const StandardHeaderToolbarPage = {
  render: () => html`
    <mlv-card container="full" style="--border-bottom: 0">
      <mlv-card-content mlv-layout="row align:space-between align:vertical-center pad-x:xl">
        <!--Left Controls-->
        <section mlv-layout="row gap:md align:left align:vertical-center" style="width: 33%">
          <div>
            <mlv-button-group container="flat">
              <mlv-icon-button size="sm" icon-name="layers"></mlv-icon-button>
              <mlv-icon-button size="sm" icon-name="cursor-rays"></mlv-icon-button>
              <mlv-icon-button size="sm" pressed icon-name="hand"></mlv-icon-button>
            </mlv-button-group>
          </div>
          <div mlv-layout="row gap:sm">
            <mlv-button interaction="flat">Edit</mlv-button>
            <mlv-button interaction="flat">History</mlv-button>
            <mlv-button interaction="flat">Docs</mlv-button>
          </div>
        </section>

        <h1 mlv-text="heading xs semibold">Page Title</h1>

        <!-- Action Buttons -->
        <mlv-button-group container="flat" style="width: 33%" mlv-layout="row align:right">
          <mlv-icon-button size="sm" icon-name="add-comment"></mlv-icon-button>
          <mlv-icon-button size="sm" icon-name="bell"></mlv-icon-button>
          <mlv-icon-button size="sm" icon-name="more-actions"></mlv-icon-button>
        </mlv-button-group>
      </mlv-card-content>
    </mlv-card>
  `
}

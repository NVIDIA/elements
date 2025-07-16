import { html } from 'lit';
import '@nvidia-elements/core/badge/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/breadcrumb/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/tabs/define.js';

export default {
  title: 'Patterns/Examples'
};

/* Main Page Headers */
export const StandardHeaderMainPage = {
  render: () => html`
    <nve-card container="flat">
      <nve-card-content nve-layout="column gap:md align:stretch pad-x:xl">
        <!-- Breadcrumbs -->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <h1 nve-text="heading lg semibold">Page Title</h1>

          <!-- Action Buttons -->
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-button interaction="emphasis">Emphasis</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>
      </nve-card-content>
    </nve-card>
  `
}

export const TabsHeaderMainPage = {
  render: () => html`
    <nve-card container="flat" style="--border-bottom: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)">
      <nve-card-content style="--padding: 0" nve-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!-- Breadcrumbs -->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <h1 nve-text="heading lg semibold">Page Title</h1>

          <!-- Action Buttons -->
          <div nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-button interaction="emphasis">Emphasis</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </div>
        </div>

        <!-- Tabs -->
        <nve-tabs behavior-select>
          <nve-tabs-item selected>Tab 1</nve-tabs-item>
          <nve-tabs-item>Tab 2</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
          <nve-tabs-item>Tab 4</nve-tabs-item>
        </nve-tabs>
      </nve-card-content>
    </nve-card>
  `
}

export const StackedMetadataHeaderMainPage = {
  render: () => html`
    <nve-card container="flat">
      <nve-card-content nve-layout="column gap:md align:stretch pad-x:xl">
        <!-- Breadcrumbs -->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <h1 nve-text="heading lg semibold">Page Title</h1>

          <!-- Action Buttons -->
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-button interaction="emphasis">Emphasis</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>

        <!-- Metadata -->
        <section nve-layout="row gap:xl align:vertical-center">
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Session ID</span>
            <a nve-text="body sm bold link" href="#">13245768</a>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Driver</span>
            <span nve-text="body sm bold">Jane Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Co-Pilot</span>
            <span nve-text="body sm bold">John Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Route</span>
            <span nve-text="body sm bold">Santa Clara</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Status</span>
            <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
          </div>
        </section>
      </nve-card-content>
    </nve-card>
  `
}

export const InlineMetadataHeaderMainPage = {
  render: () => html`
    <nve-card container="flat">
      <nve-card-content nve-layout="column gap:md align:stretch pad-x:xl">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <h1 nve-text="heading lg semibold">Page Title</h1>

          <!-- Metadata -->
          <div nve-layout="row gap:xl align:vertical-center">
            <section nve-layout="row gap:xl align:vertical-center">
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Session ID</span>
                <a nve-text="body sm bold link" href="#">13245768</a>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Driver</span>
                <span nve-text="body sm bold">Jane Doe</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Co-Pilot</span>
                <span nve-text="body sm bold">John Doe</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Route</span>
                <span nve-text="body sm bold">Santa Clara</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
              </div>
            </section>

            <nve-divider orientation="vertical"></nve-divider>

            <!-- Action Buttons -->
            <section nve-layout="row gap:sm align:vertical-center">
              <nve-button>Default</nve-button>
              <nve-button interaction="emphasis">Emphasis</nve-button>
              <nve-icon-button icon-name="more-actions"></nve-icon-button>
            </section>
          </div>
        </div>
      </nve-card-content>
    </nve-card>
  `
}

export const InlineKitchenSinkHeaderMainPage = {
  render: () => html`
    <nve-card container="flat" style="--border-bottom: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)">
      <nve-card-content style="--padding: 0" nve-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <nve-button><a href="#" target="_self">Item 2</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
            <h1 nve-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Metadata -->
          <div nve-layout="row gap:xl align:vertical-center">
            <section nve-layout="row gap:xl align:vertical-center">
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Session ID</span>
                <a nve-text="body sm bold link" href="#">13245768</a>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Driver</span>
                <span nve-text="body sm bold">Jane Doe</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Co-Pilot</span>
                <span nve-text="body sm bold">John Doe</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Route</span>
                <span nve-text="body sm bold">Santa Clara</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
              </div>
            </section>

            <!--Divider-->
            <nve-divider orientation="vertical"></nve-divider>

            <!-- Action Buttons -->
            <section nve-layout="row gap:sm align:vertical-center">
              <nve-button>Default</nve-button>
              <nve-icon-button icon-name="more-actions"></nve-icon-button>
            </section>
          </div>
        </div>

        <!--Tabs-->
        <nve-tabs behavior-select>
          <nve-tabs-item selected>Tab 1</nve-tabs-item>
          <nve-tabs-item>Tab 2</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
          <nve-tabs-item>Tab 4</nve-tabs-item>
        </nve-tabs>
      </nve-card-content>
    </nve-card>
  `
}

export const StackedKitchenSinkHeaderMainPage = {
  render: () => html`
    <nve-card container="flat" style="--border-bottom: var(--nve-ref-border-width-sm) solid var(--nve-ref-border-color-muted)">
      <nve-card-content style="--padding: 0" nve-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <nve-button><a href="#" target="_self">Item 2</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
            <h1 nve-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>

        <!-- Metadata -->
        <section nve-layout="row gap:xl align:vertical-center">
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Session ID</span>
            <a nve-text="body sm bold link" href="#">13245768</a>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Driver</span>
            <span nve-text="body sm bold">Jane Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Co-Pilot</span>
            <span nve-text="body sm bold">John Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Route</span>
            <span nve-text="body sm bold">Santa Clara</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Status</span>
            <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
          </div>
        </section>

        <!--Tabs-->
        <nve-tabs behavior-select>
          <nve-tabs-item selected>Tab 1</nve-tabs-item>
          <nve-tabs-item>Tab 2</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
          <nve-tabs-item>Tab 4</nve-tabs-item>
        </nve-tabs>
      </nve-card-content>
    </nve-card>
  `
}



/* Detail Page Headers */
export const StandardHeaderDetailPage = {
  render: () => html`
    <nve-card container="full">
      <nve-card-content nve-layout="column gap:md align:stretch pad-x:xl">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <nve-button><a href="#" target="_self">Item 2</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
            <h1 nve-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>
      </nve-card-content>
    </nve-card>
  `
}

export const TabsHeaderDetailPage = {
  render: () => html`
    <nve-card container="full">
      <nve-card-content style="--padding: 0" nve-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <nve-button><a href="#" target="_self">Item 2</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
            <h1 nve-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <div nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </div>
        </div>

        <!--Tabs-->
        <nve-tabs behavior-select>
          <nve-tabs-item selected>Tab 1</nve-tabs-item>
          <nve-tabs-item>Tab 2</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
          <nve-tabs-item>Tab 4</nve-tabs-item>
        </nve-tabs>
      </nve-card-content>
    </nve-card>
  `
}

export const StackedMetadataHeaderDetailPage = {
  render: () => html`
    <nve-card container="full">
      <nve-card-content nve-layout="column gap:md align:stretch pad-x:xl">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <nve-button><a href="#" target="_self">Item 2</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
            <h1 nve-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>

        <!-- Metadata -->
        <section nve-layout="row gap:xl align:vertical-center">
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Session ID</span>
            <a nve-text="body sm bold link" href="#">13245768</a>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Driver</span>
            <span nve-text="body sm bold">Jane Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Co-Pilot</span>
            <span nve-text="body sm bold">John Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Route</span>
            <span nve-text="body sm bold">Santa Clara</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Status</span>
            <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
          </div>
        </section>
      </nve-card-content>
    </nve-card>
  `
}

export const InlineMetadataHeaderDetailPage = {
  render: () => html`
    <nve-card container="full">
      <nve-card-content nve-layout="column gap:md align:stretch pad-x:xl">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <nve-button><a href="#" target="_self">Item 2</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
            <h1 nve-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Metadata -->
          <div nve-layout="row gap:xl align:vertical-center">
            <section nve-layout="row gap:xl align:vertical-center">
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Session ID</span>
                <a nve-text="body sm bold link" href="#">13245768</a>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Driver</span>
                <span nve-text="body sm bold">Jane Doe</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Co-Pilot</span>
                <span nve-text="body sm bold">John Doe</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Route</span>
                <span nve-text="body sm bold">Santa Clara</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
              </div>
            </section>

            <!--Divider-->
            <nve-divider orientation="vertical"></nve-divider>

            <!-- Action Buttons -->
            <section nve-layout="row gap:sm align:vertical-center">
              <nve-button>Default</nve-button>
              <nve-icon-button icon-name="more-actions"></nve-icon-button>
            </section>
          </div>
        </div>
      </nve-card-content>
    </nve-card>
  `
}

export const InlineKitchenSinkHeaderDetailPage = {
  render: () => html`
    <nve-card container="full">
      <nve-card-content style="--padding: 0" nve-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <nve-button><a href="#" target="_self">Item 2</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
            <h1 nve-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Metadata -->
          <div nve-layout="row gap:xl align:vertical-center">
            <section nve-layout="row gap:xl align:vertical-center">
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Session ID</span>
                <a nve-text="body sm bold link" href="#">13245768</a>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Driver</span>
                <span nve-text="body sm bold">Jane Doe</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Co-Pilot</span>
                <span nve-text="body sm bold">John Doe</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Route</span>
                <span nve-text="body sm bold">Santa Clara</span>
              </div>
              <div nve-layout="column gap:sm align:left">
                <span nve-text="body sm muted">Status</span>
                <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
              </div>
            </section>

            <!--Divider-->
            <nve-divider orientation="vertical"></nve-divider>

            <!-- Action Buttons -->
            <section nve-layout="row gap:sm align:vertical-center">
              <nve-button>Default</nve-button>
              <nve-icon-button icon-name="more-actions"></nve-icon-button>
            </section>
          </div>
        </div>

        <!--Tabs-->
        <nve-tabs behavior-select>
          <nve-tabs-item selected>Tab 1</nve-tabs-item>
          <nve-tabs-item>Tab 2</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
          <nve-tabs-item>Tab 4</nve-tabs-item>
        </nve-tabs>
      </nve-card-content>
    </nve-card>
  `
}

export const StackedKitchenSinkHeaderDetailPage = {
  render: () => html`
    <nve-card container="full">
      <nve-card-content style="--padding: 0" nve-layout="column gap:md align:stretch pad-x:xl pad-top:md">
        <!--Breadcrumbs-->
        <nve-breadcrumb>
          <nve-button><a href="#" target="_self">Item 1</a></nve-button>
          <nve-button><a href="#" target="_self">Item 2</a></nve-button>
          <span>You Are Here</span>
        </nve-breadcrumb>

        <div nve-layout="row align:space-between align:vertical-center">
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
            <h1 nve-text="heading lg semibold">Page Title</h1>
          </section>

          <!-- Action Buttons -->
          <section nve-layout="row gap:sm align:vertical-center">
            <nve-button>Default</nve-button>
            <nve-icon-button icon-name="more-actions"></nve-icon-button>
          </section>
        </div>

        <!-- Metadata -->
        <section nve-layout="row gap:xl align:vertical-center">
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Session ID</span>
            <a nve-text="body sm bold link" href="#">13245768</a>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Driver</span>
            <span nve-text="body sm bold">Jane Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Co-Pilot</span>
            <span nve-text="body sm bold">John Doe</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Route</span>
            <span nve-text="body sm bold">Santa Clara</span>
          </div>
          <div nve-layout="row gap:sm align:center">
            <span nve-text="body sm muted">Status</span>
            <span nve-text="body sm bold"><nve-badge status="success">complete</nve-badge></span>
          </div>
        </section>

        <!--Tabs-->
        <nve-tabs behavior-select>
          <nve-tabs-item selected>Tab 1</nve-tabs-item>
          <nve-tabs-item>Tab 2</nve-tabs-item>
          <nve-tabs-item>Tab 3</nve-tabs-item>
          <nve-tabs-item>Tab 4</nve-tabs-item>
        </nve-tabs>
      </nve-card-content>
    </nve-card>
  `
}


/* Viewer Page Headers */
export const StandardHeaderViewerPage = {
  render: () => html`
    <nve-card container="full" style="--border-bottom: 0">
      <nve-card-content nve-layout="row align:space-between align:vertical-center pad-x:xl">
        <section nve-layout="row gap:sm align:vertical-center">
          <nve-icon-button icon-name="arrow" direction="left" size="sm"></nve-icon-button>
          <h1 nve-text="heading xs semibold">Page Title</h1>
        </section>

        <!--Center Controls-->
        <section nve-layout="row align:center align:vertical-center gap:xxxs">
          <nve-select container="flat" style="--border-bottom: 0">
            <select>
              <option value="1">100%</option>
              <option value="2">75%</option>
              <option value="3">50%</option>
              <option value="4">25%</option>
            </select>
          </nve-select>
          <nve-button-group container="flat" behavior-select="single">
            <nve-icon-button size="sm" pressed icon-name="view-as-grid"></nve-icon-button>
            <nve-icon-button size="sm" icon-name="split-vertical"></nve-icon-button>
            <nve-icon-button size="sm" icon-name="split-horizontal"></nve-icon-button>
            <nve-icon-button size="sm" icon-name="split-none"></nve-icon-button>
          </nve-button-group>
        </section>

        <!-- Action Buttons -->
        <nve-button-group container="flat">
          <nve-icon-button size="sm" icon-name="download"></nve-icon-button>
          <nve-icon-button size="sm" icon-name="refresh"></nve-icon-button>
          <nve-icon-button size="sm" icon-name="more-actions"></nve-icon-button>
        </nve-button-group>
      </nve-card-content>
    </nve-card>
  `
}


/* Toolbar Page Headers */
export const StandardHeaderToolbarPage = {
  render: () => html`
    <nve-card container="full" style="--border-bottom: 0">
      <nve-card-content nve-layout="row align:space-between align:vertical-center pad-x:xl">
        <!--Left Controls-->
        <section nve-layout="row gap:md align:left align:vertical-center" style="width: 33%">
          <div>
            <nve-button-group container="flat">
              <nve-icon-button size="sm" icon-name="layers"></nve-icon-button>
              <nve-icon-button size="sm" icon-name="cursor-rays"></nve-icon-button>
              <nve-icon-button size="sm" pressed icon-name="hand"></nve-icon-button>
            </nve-button-group>
          </div>
          <div nve-layout="row gap:sm">
            <nve-button container="flat">Edit</nve-button>
            <nve-button container="flat">History</nve-button>
            <nve-button container="flat">Docs</nve-button>
          </div>
        </section>

        <h1 nve-text="heading xs semibold">Page Title</h1>

        <!-- Action Buttons -->
        <nve-button-group container="flat" style="width: 33%" nve-layout="row align:right">
          <nve-icon-button size="sm" icon-name="add-comment"></nve-icon-button>
          <nve-icon-button size="sm" icon-name="bell"></nve-icon-button>
          <nve-icon-button size="sm" icon-name="more-actions"></nve-icon-button>
        </nve-button-group>
      </nve-card-content>
    </nve-card>
  `
}

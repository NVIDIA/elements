import { html } from 'lit';
import '@nvidia-elements/core/panel/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/notification/define.js';

export default {
  title: 'Elements/Panel/Examples',
  component: 'nve-panel'
};

export const Default = {
  render: () => html`
    <section nve-layout="row align:space-between pad:sm">
      <div nve-theme="root">
        <nve-panel behavior-expand expanded side="left" style="width:280px; height:550px">

          <nve-panel-header>
            <div slot="title">Title</div>
            <div slot="subtitle"></div>
          </nve-panel-header>

          <nve-panel-content nve-layout="column gap:md">
            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Release</label>
              <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Date</label>
              <p nve-text="label semibold sm">2021-08-18</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">State</label>
              <nve-badge status="finished">Indexed</nve-badge>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Driver</label>
              <p nve-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Copilot</label>
              <p nve-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">GVS</label>
              <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Session ID</label>
              <a href="#" nve-text="link body sm">Experiment 12345</a>
            </div>
          </nve-panel-content>
        </nve-panel>
      </div>
    </section>
  `
};

export const LeftSidePanel = {
  render: () => html`
    <section nve-layout="row align:space-between pad:sm">
      <div nve-theme="root">
        <nve-panel behavior-expand id expanded side="left" style="width:280px; height:550px">

          <nve-panel-content nve-layout="column gap:md">
            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Release</label>
              <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Date</label>
              <p nve-text="label semibold sm">2021-08-18</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">State</label>
              <nve-badge status="finished">Indexed</nve-badge>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Driver</label>
              <p nve-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Copilot</label>
              <p nve-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">GVS</label>
              <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Session ID</label>
              <a href="#" nve-text="link body sm">Experiment 12345</a>
            </div>
          </nve-panel-content>
        </nve-panel>
      </div>
    </section>
  `
};

export const RightSidePanel = {
  render: () => html`
    <section nve-layout="row align:space-between pad:sm">
      <div nve-theme="root">
        <nve-panel behavior-expand expanded side="right" style="width:280px; height:550px">

          <nve-panel-content nve-layout="column gap:md">
            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Release</label>
              <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Date</label>
              <p nve-text="label semibold sm">2021-08-18</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">State</label>
              <nve-badge status="finished">Indexed</nve-badge>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Driver</label>
              <p nve-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Copilot</label>
              <p nve-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">GVS</label>
              <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Session ID</label>
              <a href="#" nve-text="link body sm">Experiment 12345</a>
            </div>
          </nve-panel-content>
        </nve-panel>
      </div>
    </section>
  `
};

export const ClosablePanel = {
  render: () => html`
    <section nve-layout="row align:space-between pad:sm full">
      <div nve-theme="root">
        <nve-panel behavior-expand id="trigger-closable-false" expanded side="left" style="width:280px; height:550px">

          <nve-panel-content nve-layout="column gap:md">
            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Release</label>
              <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Date</label>
              <p nve-text="label semibold sm">2021-08-18</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">State</label>
              <nve-badge status="finished">Indexed</nve-badge>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Driver</label>
              <p nve-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Copilot</label>
              <p nve-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">GVS</label>
              <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Session ID</label>
              <a href="#" nve-text="link body sm">Experiment 12345</a>
            </div>
          </nve-panel-content>
        </nve-panel>
      </div>

      <nve-button interaction="emphasis">Toggle Panel</nve-button>
    </section>

    <script type="module">
      const button = document.querySelector('nve-button');
      button.addEventListener('click', () => {
        const panel = document.querySelector('nve-panel');
        panel.expanded = !panel.expanded;
      });
    </script>
  `
};

export const PanelWithTrigger = {
  render: () => html`
    <section nve-layout="row align:space-between pad:sm full">
      <div nve-theme="root">
        <nve-panel behavior-expand expanded closable side="left"  style="width:280px; height:550px">

          <nve-panel-content nve-layout="column gap:md">
            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Release</label>
              <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Date</label>
              <p nve-text="label semibold sm">2021-08-18</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">State</label>
              <nve-badge status="finished">Indexed</nve-badge>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Driver</label>
              <p nve-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Copilot</label>
              <p nve-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">GVS</label>
              <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Session ID</label>
              <a href="#" nve-text="link body sm">Experiment 12345</a>
            </div>
          </nve-panel-content>
        </nve-panel>
      </div>

      <nve-button interaction="emphasis">Toggle Panel</nve-button>
    </section>

    <script type="module">
      const button = document.querySelector('nve-button');

      button.addEventListener('click', () => {
        const panel = document.querySelector('nve-panel');
        panel.expanded = !panel.expanded;
      });
    </script>
  `
};

export const PanelWithFullHeader = {
  render: () => html`
    <section nve-layout="row align:space-between pad:sm">
      <div nve-theme="root">
        <nve-panel behavior-expand expanded side="left" style="width:280px; height:550px">

          <nve-panel-header>
            <div slot="title">Title</div>
            <div slot="subtitle">Subtitle</div>

            <nve-icon-button container="flat" slot="action-icon" icon-name="more-actions"></nve-icon-button>
          </nve-panel-header>

          <nve-panel-content nve-layout="column gap:md">
            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Release</label>
              <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Date</label>
              <p nve-text="label semibold sm">2021-08-18</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">State</label>
              <nve-badge status="finished">Indexed</nve-badge>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Driver</label>
              <p nve-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Copilot</label>
              <p nve-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">GVS</label>
              <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Session ID</label>
              <a href="#" nve-text="link body sm">Experiment 12345</a>
            </div>
          </nve-panel-content>
        </nve-panel>
      </div>
    </section>
  `
};

export const PanelWithFooter = {
  render: () => html`
    <section nve-layout="row align:space-between pad:sm">
      <div nve-theme="root">
        <nve-panel behavior-expand expanded side="left" style="width:280px; height:600px">

          <nve-panel-content nve-layout="column gap:md">
            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Release</label>
              <p nve-text="label semibold sm">RainbowBridge/08-18-2021AM/A2A</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Date</label>
              <p nve-text="label semibold sm">2021-08-18</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">State</label>
              <nve-badge status="finished">Indexed</nve-badge>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Driver</label>
              <p nve-text="label semibold sm">Kenjiro Ono</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Copilot</label>
              <p nve-text="label semibold sm">Kenichi Yoshii</p>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">GVS</label>
              <a href="#" nve-text="link body sm">http://testbot/testbot/view/content...</a>
            </div>

            <div nve-layout="column gap:xs">
              <label nve-text="body sm medium muted">Session ID</label>
              <a href="#" nve-text="link body sm">Experiment 12345</a>
            </div>
          </nve-panel-content>

          <nve-panel-footer>
            <nve-button interaction="destructive" container="flat">Destructive</nve-button>
            <nve-button>Default</nve-button>
          </nve-panel-footer>
        </nve-panel>
      </div>
    </section>
  `
};
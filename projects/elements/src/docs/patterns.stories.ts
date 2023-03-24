import { html } from 'lit';

import '@elements/elements/badge/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Patterns/Page/Stories'
};

export const Header = {
  render: () => html`
    <div nve-theme="root">
      <nve-card style="--border-radius: none">
        <section nve-layout="column gap:lg align:stretch pad-top:md pad-right:xl pad-bottom:md pad-left:xl">
          <div nve-layout="row gap:md align:center">
            <h1 nve-text="heading lg semibold">Page Title</h1>
            <div nve-layout="row gap:sm" style="margin-left: auto">
              <nve-icon-button icon-name="information" aria-label="information"></nve-icon-button>
              <nve-icon-button icon-name="edit" aria-label="edit"></nve-icon-button>
              <nve-icon-button icon-name="additional-actions" aria-label="additional actions"></nve-icon-button>
            </div>
          </div>
          <div nve-layout="row gap:xl align:vertical-center">
            <section nve-layout="row gap:xs align:center">
              <span nve-text="body muted">Session ID</span>
              <a nve-text="body bold link" href="#">13245768</a>
            </section>

            <section nve-layout="row gap:xs align:center">
              <span nve-text="body muted">Driver</span>
              <span nve-text="body bold">Jane Doe</span>
            </section>

            <section nve-layout="row gap:xs align:center">
              <span nve-text="body muted">Co-Pilot</span>
              <span nve-text="body bold">John Doe</span>
            </section>

            <section nve-layout="row gap:xs align:center">
              <span nve-text="body muted">Route</span>
              <span nve-text="body bold">Santa Clara</span>
            </section>

            <section nve-layout="row gap:xs align:center">
              <span nve-text="body muted">Status</span>
              <span nve-text="body bold"><nve-badge status="success">complete</nve-badge></span>
            </section>
          </div>
        </section>
      </nve-card>
    </div>
  `
}

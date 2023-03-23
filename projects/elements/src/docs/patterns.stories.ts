import { html } from 'lit';

import '@elements/elements/badge/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/icon-button/define.js';

export default {
  title: 'Patterns/Page/Stories'
};

export const Header = {
  render: () => html`
    <div mlv-theme="root">
      <mlv-card style="--border-radius: none">
        <section mlv-layout="column gap:lg align:stretch pad-top:md pad-right:xl pad-bottom:md pad-left:xl">
          <div mlv-layout="row gap:md align:center">
            <h1 mlv-text="heading lg semibold">Page Title</h1>
            <div mlv-layout="row gap:sm" style="margin-left: auto">
              <mlv-icon-button icon-name="information" aria-label="information"></mlv-icon-button>
              <mlv-icon-button icon-name="edit" aria-label="edit"></mlv-icon-button>
              <mlv-icon-button icon-name="menu" aria-label="additional actions"></mlv-icon-button>
            </div>
          </div>
          <div mlv-layout="row gap:xl align:vertical-center">
            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body muted">Session ID</span>
              <a mlv-text="body bold link" href="#">13245768</a>
            </section>

            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body muted">Driver</span>
              <span mlv-text="body bold">Jane Doe</span>
            </section>

            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body muted">Co-Pilot</span>
              <span mlv-text="body bold">John Doe</span>
            </section>

            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body muted">Route</span>
              <span mlv-text="body bold">Santa Clara</span>
            </section>

            <section mlv-layout="row gap:xs align:center">
              <span mlv-text="body muted">Status</span>
              <span mlv-text="body bold"><mlv-badge status="success">complete</mlv-badge></span>
            </section>
          </div>
        </section>
      </mlv-card>
    </div>
  `
}

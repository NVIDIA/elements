import { html, LitElement } from 'lit';
import { hostAttr, useStyles } from '@nvidia-elements/core/internal';
import styles from './page-panel-header.css?inline';

/**
 * @element nve-page-panel-header
 * @description Displays the title and contextual controls at the top of a page panel to identify its purpose.
 * @entrypoint \@nvidia-elements/core/page
 * @since 1.15.0
 * @slot - default slot for the page panel header
 * @cssprop --border-bottom
 * @cssprop --min-height
 * @cssprop --padding
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 *
 */
export class PagePanelHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-panel-header',
    version: '0.0.0'
  };

  @hostAttr() slot = 'header';

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}

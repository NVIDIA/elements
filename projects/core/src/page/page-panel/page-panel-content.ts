import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './page-panel-content.css?inline';

/**
 * @element nve-page-panel-content
 * @description Contains the scrollable main body content within a page panel region.
 * @entrypoint \@nvidia-elements/core/page
 * @since 1.15.0
 * @slot - default slot for the page-panel content
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 *
 */
export class PagePanelContent extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-panel-content',
    version: '0.0.0'
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}

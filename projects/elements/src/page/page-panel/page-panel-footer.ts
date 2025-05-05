import { html, LitElement } from 'lit';
import { hostAttr, useStyles } from '@nvidia-elements/core/internal';
import styles from './page-panel-footer.css?inline';

/**
 * @element nve-page-panel-footer
 * @entrypoint \@nvidia-elements/core/page
 * @since 1.15.0
 * @slot - default slot for the page-panel footer
 * @cssprop --border-top
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --min-height
 * @storybook https://NVIDIA.github.io/elements/docs/elements/page/
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=30-54&node-type=canvas&t=MpkuCQK1YGf307s2-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
 * @stable false
 */
export class PagePanelFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-panel-footer',
    version: '0.0.0'
  };

  @hostAttr() slot = 'footer';

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}

import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './page-header.css?inline';

/**
 * @element nve-page-header
 * @description An element that appears across the top of all pages containing the application name and primary navigation.
 * @entrypoint \@nvidia-elements/core/page-header
 * @since 1.15.0
 * @slot
 * @slot prefix
 * @slot suffix
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-bottom
 * @storybook https://NVIDIA.github.io/elements/docs/elements/page-header/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=30-35&t=c9DaB6YRpkhGAp49-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav
 * @stable false
 */
export class PageHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-page-header',
    version: '0.0.0'
  };

  render() {
    return html`
      <div internal-host>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  /** @private */
  declare _internals: ElementInternals;

  connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'navigation';
  }
}

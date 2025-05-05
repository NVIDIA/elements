import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size } from '@nvidia-elements/core/internal';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './pulse.css?inline';

/**
 * @element nve-pulse
 * @description Pulse component is used for signaling/attention for a particular area of a UI. This is helpful for tutorial/getting started guides for new users.
 * @since 1.16.3
 * @entrypoint \@nvidia-elements/core/pulse
 * @cssprop --background
 * @cssprop --width
 * @cssprop --height
 * @storybook https://NVIDIA.github.io/elements/docs/elements/pulse/
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=29-12&node-type=canvas&t=gtGIoHonVSNM6733-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 * @stable false
 */
export class Pulse extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-pulse',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  /** @private */
  declare _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'alert';
  }

  /** Sets size of the pulse component. Size can also be updated using the `width + height` css props. */
  @property({ type: String, reflect: true }) size?: Size | 'xs';

  /** These are visual treatments that represent the `status` of varius tasks. When `status` is set to `accent`,  `warning` or `danger`, appropriate colors are embedded. */
  @property({ type: String, reflect: true }) status?: 'accent' | 'warning' | 'danger';

  render() {
    return html`
    <svg internal-host width="100%" height="100%" viewBox="0 0 200 200">
      <circle class="circle" cx="100" cy="100" r="25"></circle>
      <circle class="circle c1" cx="100" cy="100" r="25"></circle>
      <circle class="circle c2" cx="100" cy="100" r="25"></circle> 
      <circle class="circle c3" cx="100" cy="100" r="25"></circle>
    </svg>
  `;
  }
}

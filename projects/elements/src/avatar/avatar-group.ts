import { LitElement, html } from 'lit';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './avatar-group.css?inline';

/**
 * @element nve-avatar-group
 * @description An avatar group displays a collection of user avatars in a compact and organized layout, showcasing multiple participants or contributors in a space-efficient way.
 * @since 1.20.0
 * @entrypoint \@nvidia-elements/core/avatar
 * @slot - default slot for content
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-avatar-documentation--docs
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=29-13&t=lPkYCkCgnoVaRSbI-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 * @stable false
 */
export class AvatarGroup extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-avatar-group',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
    <div internal-host>
        <slot></slot>
    </div>
  `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
  }
}

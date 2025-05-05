import { html, LitElement } from 'lit';
import { useStyles, attachInternals } from '@nvidia-elements/core/internal';
import styles from './placeholder.css?inline';

/**
 * @element nve-grid-placeholder
 * @since 0.11.0
 * @entrypoint \@nvidia-elements/core/grid
 * @description Placeholder can be used to display a message when data is being loaded for the grid or empty states for datasets.
 * @slot - default slot for content
 * @cssprop --color
 * @cssprop --padding
 * @storybook https://NVIDIA.github.io/elements/docs/elements/grid/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-33&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
export class GridPlaceholder extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-grid-placeholder',
    version: '0.0.0'
  };

  /** @private */
  _internals: ElementInternals;

  render() {
    return html`
      <div internal-host focusable="active" role="gridcell">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'row';
  }
}

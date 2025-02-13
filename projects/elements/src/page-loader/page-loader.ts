import { LitElement, html } from 'lit';
import type { PopoverPosition, PopoverType } from '@nvidia-elements/core/internal';
import { popoverStyles, TypeNativePopoverController, useStyles } from '@nvidia-elements/core/internal';
import { ProgressRing } from '@nvidia-elements/core/progress-ring';
import styles from './page-loader.css?inline';

/**
 * @element nve-page-loader
 * @description Page Loader is a full-screen version of the `progress-ring` component, for use when the page should remain unusable as the loader is displayed.
 * @since 0.19.0
 * @entrypoint \@nvidia-elements/core/page-loader
 * @slot - default slot for content
 * @cssprop --gap
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-page-loader-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=8866%3A125698&mode=dev
 */
export class PageLoader extends LitElement {
  /** @private */
  readonly position: PopoverPosition = 'center';

  /** @private */
  readonly popoverType: PopoverType = 'manual';

  /** @private */
  protected typeNativePopoverController = new TypeNativePopoverController<PageLoader>(this);

  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-page-loader',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [ProgressRing.metadata.tag]: ProgressRing
  };

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`
      <div internal-host>
        <nve-progress-ring status="accent" size="xl"></nve-progress-ring>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.states.add('anchor-body');
  }
}

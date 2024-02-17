import { LitElement, html } from 'lit';
import {
  popoverBaseStyles,
  PopoverPosition,
  PopoverType,
  TypePopoverController,
  useStyles
} from '@elements/elements/internal';
import { ProgressRing } from '@elements/elements/progress-ring';
import styles from './page-loader.css?inline';

/**
 * @element mlv-page-loader
 * @description Page Loader is a full-screen version of the `progress-ring` component, for use when the page should remain unusable as the loader is displayed.
 * @since 0.19.0
 * @slot - default slot for content
 * @cssprop --gap
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-page-loader-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=8866%3A125698&mode=dev
 * @stable false
 */
export class PageLoader extends LitElement {
  /** @private */
  position: PopoverPosition = 'center';

  /** @private */
  popoverType: PopoverType = 'auto';

  /** @private */
  _typePopoverController = new TypePopoverController<PageLoader>(this);

  static styles = useStyles([popoverBaseStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-page-loader',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    [ProgressRing.metadata.tag]: ProgressRing
  };

  render() {
    return html`
      <dialog>
        <div internal-host>
          <mlv-progress-ring status="accent" size="xl"></mlv-progress-ring>
          <slot></slot>
        </div>
      </dialog>
    `;
  }
}

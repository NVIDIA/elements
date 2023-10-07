import { html, LitElement } from 'lit';
import { popoverBaseStyles, PopoverPosition, PopoverType, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './page-loader.css?inline';
import { ProgressRing } from '@elements/elements/progress-ring';

/**
 * @element mlv-page-loader
 * @description Page Loader is a full-screen version of the mlv-progress-ring component, for use when the page should remain unusable as the loader is displayed.
 * @since 0.19.0
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-page-loader-documentation--docs
 * @figma
 * @aria
 */
export class PageLoader extends LitElement {

  /** @private */
  public position: PopoverPosition = 'center';
  /** @private */
  public closable: boolean = false;
  /** @private */
  public modal: boolean = true;
  /** @private */
  public popoverType: PopoverType = 'auto';
  /** @private */
  _typePopoverController = new TypePopoverController<PageLoader>(this);

  static styles = useStyles([popoverBaseStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-page-loader',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-progress-ring': ProgressRing
  }

  render() {
    return html`
      <dialog>
        <mlv-progress-ring status="accent" size="xl"></mlv-progress-ring>
      </dialog>
    `;
  }
}

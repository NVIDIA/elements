import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, keyNavigationList, KeynavListConfig, useStyles } from '@elements/elements/internal';
import styles from './segment-button.css?inline';
import { IconButton } from '@elements/elements/icon-button';
import { Button } from '@elements/elements/button';

/**
 * @alpha
 * @element mlv-segment-button
 * @slot - slotted mlv-buttons or mlv-icon-buttons
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-segment-button-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=4047-92996&mode=design&t=XPYuD3f2yaKCAMl3-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 * @vqa false
 * @stable false
 */

@keyNavigationList<SegmentButton>()
export class SegmentButton extends LitElement {
  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.querySelectorAll<Button | IconButton>('mlv-icon-button, mlv-button'),
      layout: 'horizontal'
    }
  }

  @property({ type: Boolean, attribute: 'behavior-select' }) behaviorSelect: boolean;

  get #buttons() {
    return Array.from(this.querySelectorAll<Button | IconButton>('mlv-icon-button, mlv-button'));
  }

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-segment-button',
    version: 'PACKAGE_VERSION'
  };

  /** @private */
  declare _internals: ElementInternals;

  #selectButton(button) {
    if (!this.behaviorSelect || (button.tagName !== 'MLV-BUTTON' && button.tagName !== 'MLV-ICON-BUTTON') || button.disabled) {
      return;
    }

    this.keynavListConfig.items.forEach((i: Button | IconButton) => i.pressed = false);
    button.pressed = true;
  }

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
    this._internals.role = 'button';

    this.addEventListener('click', (e: CustomEvent) => (this.#selectButton(e.target)))
  }
}

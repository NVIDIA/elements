import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, keyNavigationList, KeynavListConfig, useStyles } from '@elements/elements/internal';
import styles from './button-group.css?inline';
import type { IconButton } from '@elements/elements/icon-button';
import type { Button } from '@elements/elements/button';

/**
 * @element nve-button-group
 * @description A button group is a control that enables users to choose between two or more distinct mutually exclusive options.
 * @since 0.16.0
 * @slot - slotted nve-buttons or nve-icon-buttons
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --padding
 * @cssprop --width
 * @cssprop --gap
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-button-group-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?type=design&node-id=4047-92996&mode=design&t=XPYuD3f2yaKCAMl3-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/group_role
 * @vqa false
 * @unitTests false
 * @stable false
 * @axe false
 */

@keyNavigationList<ButtonGroup>()
export class ButtonGroup extends LitElement {
  /** @private */
  get keynavListConfig(): KeynavListConfig {
    return {
      items: this.querySelectorAll<Button | IconButton>('nve-icon-button, nve-button'),
      layout: 'horizontal'
    }
  }

  /** By default the button group is stateless. Add the `behavior-select` attribute and set to `single` or `multi` to enable stateful selction handling. */
  @property({ type: String, attribute: 'behavior-select' }) behaviorSelect: 'single' | 'multi';

  /** Set the style of the button group using the `container` property. Options are the default display when the attribute is left off, `flat` or `rounded`. */
  @property({ type: String, reflect: true }) container?: undefined | 'flat' | 'rounded';

  /** Determines the orientation direction of the group. Vertical groups are limited to icon buttons only. */
  @property({ type: String, reflect: true }) orientation?: 'horizontal' | 'vertical' = 'horizontal';

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-button-group',
    version: 'PACKAGE_VERSION'
  };

  /** @private */
  declare _internals: ElementInternals;

  #selectButton(button) {
    if (this.behaviorSelect === undefined || (button.tagName !== 'MLV-BUTTON' && button.tagName !== 'MLV-ICON-BUTTON') || button.disabled) {
      return;
    }

    if (this.behaviorSelect === 'single') {
      // Deselect all buttons first, then select one
      this.keynavListConfig.items.forEach((i: Button | IconButton) => i.pressed = false);
      button.pressed = true;
    }
    else if (this.behaviorSelect === 'multi') {
      // Toggle pressed on selected button
      button.pressed = !button.pressed;
    }
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
    this._internals.role = 'group';

    this.addEventListener('click', (e: CustomEvent) => (this.#selectButton(e.target)))
  }

  updated(props) {
    super.updated(props);

    if (this.container === 'flat') {
      Array.from(this.querySelectorAll('nve-icon-button')).forEach(btn => {
        btn.interaction = 'flat';
      });
    }

    this.toggleAttribute('split', this.querySelector('nve-divider') !== undefined);
  }
}

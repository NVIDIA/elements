import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { PopoverAlign } from '@nvidia-elements/core/internal';
import {
  popoverStyles,
  TypeNativeAnchorController,
  TypeNativePopoverController,
  useStyles
} from '@nvidia-elements/core/internal';
import styles from './notification-group.css?inline';

/**
 * @element nve-notification-group
 * @description Displays real time updates without interrupting the user's workflow to communicate an important message or status.
 * @since 0.6.0
 * @slot default slot for `nve-notification`
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-notification-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=2876-64384&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 */
export class NotificationGroup extends LitElement {
  /**
   * Sets the anchor element to which the popover is attached.
   */
  @property({ type: String }) anchor: string | HTMLElement;

  /**
   * Sets the position of the popover relative to the anchor element.
   */
  @property({ type: String, reflect: true }) position;

  /**
   * Sets the alignment of the popover relative to the anchor element.
   */
  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  protected typeNativeAnchorController = new TypeNativeAnchorController<NotificationGroup>(this);

  protected typeNativePopoverController = new TypeNativePopoverController<NotificationGroup>(this);

  static styles = useStyles([popoverStyles, styles]);

  static readonly metadata = {
    tag: 'nve-notification-group',
    version: '0.0.0'
  };

  render() {
    return html`
    <div internal-host>
      <slot @slotchange=${() => this.showPopover()}></slot>
    </div>
    `;
  }
}

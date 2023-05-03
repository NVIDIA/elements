import type { CSSResult } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './input.css?inline';

export const inputStyles = styles;

/**
 * @element mlv-input
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --cursor
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-input-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
 */
export class Input extends Control {
  /** flat (embed into parent container) */
  @property({ type: String, reflect: true }) container?: 'flat';

  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-input',
    version: 'PACKAGE_VERSION'
  };
}

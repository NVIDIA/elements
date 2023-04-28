import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './radio.css?inline';

/**
 * @alpha
 * @element nve-radio
 * @cssprop --width
 * @cssprop --height
 * @cssprop --cursor
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-radio-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-16&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */
export class Radio extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-radio',
    version: 'PACKAGE_VERSION'
  };
}

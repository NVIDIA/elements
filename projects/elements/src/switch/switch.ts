import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './switch.css?inline';

/**
 * @element nve-switch
 * @cssprop --cursor
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --width
 * @cssprop --height
 * @cssprop --anchor-width
 * @cssprop --anchor-height
 * @cssprop --anchor-border-radius
 * @cssprop --anchor-background
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-switch-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-28&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 */
export class Switch extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-switch',
    version: 'PACKAGE_VERSION'
  };
}

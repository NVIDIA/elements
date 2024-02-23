import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './switch.css?inline';

/**
 * @element nve-switch
 * @description A switch is a control that enables users to switch between two mutually exclusive options (on or off, checked or unchecked) through a single click or tap.
 * @since 0.3.0
 * @cssprop --cursor
 * @cssprop --border-radius
 * @cssprop --background
 * @cssprop --width
 * @cssprop --height
 * @cssprop --anchor-width
 * @cssprop --anchor-height
 * @cssprop --anchor-border-radius
 * @cssprop --anchor-background
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-switch-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-28&t=clRGqnKDRGNhR0Yu-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 */
export class Switch extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-switch',
    version: '0.0.0'
  };
}

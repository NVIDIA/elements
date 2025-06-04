import type { CSSResult } from 'lit';
import { audit, hostAttr, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './radio.css?inline';

/**
 * @element nve-radio
 * @description A radio button is a control that enables users to choose one option from a list of mutually exclusive options.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/radio
 * @cssprop --width
 * @cssprop --height
 * @cssprop --cursor
 * @storybook https://NVIDIA.github.io/elements/docs/elements/radio/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-16&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */
@audit()
export class Radio extends Control {
  @hostAttr({ attribute: 'nve-control' }) protected nveControl = 'inline';

  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-radio',
    version: '0.0.0',
    children: ['label', 'input', 'nve-control-message']
  };
}

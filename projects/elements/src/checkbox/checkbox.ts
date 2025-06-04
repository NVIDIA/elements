import type { CSSResult } from 'lit';
import { audit, hostAttr, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './checkbox.css?inline';

/**
 * @element nve-checkbox
 * @description A checkbox is a control that enables users to choose between two distinct mutually exclusive options (checked or unchecked, on or off) through a single click or tap.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/checkbox
 * @cssprop --width
 * @cssprop --height
 * @cssprop --cursor
 * @storybook https://NVIDIA.github.io/elements/docs/elements/checkbox/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-15&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 */
@audit()
export class Checkbox extends Control {
  @hostAttr({ attribute: 'nve-control' }) protected nveControl = 'inline';

  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-checkbox',
    version: '0.0.0',
    children: ['label', 'input', 'nve-control-message']
  };
}

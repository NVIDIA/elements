import type { CSSResult } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { ControlGroup } from '@nvidia-elements/core/forms';
import styles from './radio-group.css?inline';

/**
 * @element nve-radio-group
 * @since 0.3.0
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-radio-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-16&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */
export class RadioGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-radio-group',
    version: '0.0.0'
  };
}

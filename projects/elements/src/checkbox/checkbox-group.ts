import type { CSSResult } from 'lit';
import { typeSSR, useStyles, audit } from '@nvidia-elements/core/internal';
import { ControlGroup } from '@nvidia-elements/core/forms';
import styles from './checkbox-group.css?inline';

/**
 * @element nve-checkbox-group
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/checkbox
 * @storybook https://NVIDIA.github.io/elements/docs/elements/checkbox/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-15&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 */
@audit()
@typeSSR()
export class CheckboxGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-checkbox-group',
    version: '0.0.0',
    children: ['label', 'nve-control-message', 'nve-checkbox']
  };
}

import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { ControlGroup } from '@elements/elements/forms';
import styles from './checkbox-group.css?inline';

/**
 * @element mlv-checkbox-group
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-checkbox-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-15&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 */
export class CheckboxGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-checkbox-group',
    version: 'PACKAGE_VERSION'
  };
}

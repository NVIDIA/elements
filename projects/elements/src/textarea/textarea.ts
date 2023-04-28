import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './textarea.css?inline';

/**
 * @alpha
 * @element mlv-textarea
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --width
 * @cssprop --min-height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --cursor
 * @cssprop --border
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-textarea-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
 */
export class Textarea extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-textarea',
    version: 'PACKAGE_VERSION'
  };
}

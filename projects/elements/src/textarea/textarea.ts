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
 */
export class Textarea extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-textarea',
    version: 'PACKAGE_VERSION'
  };
}

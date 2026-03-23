import type { CSSResult } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './textarea.css?inline';

/**
 * @element nve-textarea
 * @description A textarea is a control that enables users to enter and edit text.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/textarea
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --width
 * @cssprop --min-height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --cursor
 * @cssprop --border
 * @cssprop --color
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
 */
export class Textarea extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-textarea',
    version: '0.0.0'
  };
}

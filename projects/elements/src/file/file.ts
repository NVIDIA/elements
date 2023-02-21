import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './file.css?inline';
import global from './global.css?inline';

// file pseudo selectors cannot be accessed via ::slotted() so we need to append style to host
const globalStyle = document.createElement('style');
globalStyle.textContent = global;
globalStyle.className = 'mlv-file';

/**
 * @alpha
 * @element mlv-file
 */
export class File extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-file',
    version: 'PACKAGE_VERSION'
  };

  connectedCallback() {
    super.connectedCallback();
    this.appendChild(globalStyle);
  }
}

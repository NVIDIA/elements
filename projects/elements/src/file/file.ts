import type { CSSResult } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './file.css?inline';
import global from './global.css?inline';

// file pseudo selectors cannot be accessed via ::slotted() so we need to append style to host
const globalStyle = document.createElement('style');
globalStyle.textContent = global;
globalStyle.className = 'nve-file';

/**
 * @element nve-file
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-file-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 */
export class File extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-file',
    version: 'PACKAGE_VERSION'
  };

  connectedCallback() {
    super.connectedCallback();
    this.appendChild(globalStyle);
  }
}

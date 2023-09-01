import type { CSSResult } from 'lit';
import { appendRootNodeStyle, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './file.css?inline';
import globalStyles from './file.global.css?inline';

/**
 * @element mlv-file
 * @description A file picker is a control that enables users to choose a file value.
 * @since 0.3.0
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-file-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 */
export class File extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-file',
    version: 'PACKAGE_VERSION'
  };

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }
}

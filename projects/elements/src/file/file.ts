import type { CSSResult } from 'lit';
import { appendRootNodeStyle, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './file.css?inline';
import globalStyles from './file.global.css?inline';

/**
 * @element nve-file
 * @description A file picker is a control that enables users to choose a file value.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/file
 * @storybook https://NVIDIA.github.io/elements/docs/elements/file/
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 */
export class File extends Control {
  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-file',
    version: '0.0.0'
  };

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }
}

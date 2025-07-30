import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './markdown.css?inline';

/**
 * @element nve-markdown
 * @description A markdown element.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/markdown/markdown
 * @slot
 */
export class Markdown extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-markdown',
    version: '0.0.0'
  };

  static elementDefinitions = {};

  render() {
    return html`markdown element`;
  }
}

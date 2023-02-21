import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './search.css?inline';

/**
 * @alpha
 * @element nve-search
 */
export class Search extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-search',
    version: 'PACKAGE_VERSION'
  };

  protected get prefixContent() {
    return html`<nve-icon-button icon-name="search" interaction="ghost" readonly></nve-icon-button>`;
  }
}

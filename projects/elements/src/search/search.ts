import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './search.css?inline';

/**
 * @element mlv-search
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-search-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-22&t=clRGqnKDRGNhR0Yu-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/search
 */
export class Search extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-search',
    version: 'PACKAGE_VERSION'
  };

  protected get prefixContent() {
    return html`<mlv-icon-button icon-name="search" interaction="ghost" readonly></mlv-icon-button>`;
  }
}

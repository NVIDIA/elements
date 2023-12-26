import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, ContainerElement } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './search.css?inline';

/**
 * @element nve-search
 * @description A search is a control that enables users to enter text to search.
 * @since 0.3.0
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-search-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-22&t=clRGqnKDRGNhR0Yu-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/search
 */
export class Search extends Control implements ContainerElement {
  /**
   * Flat container option is used when embeding component within another containing element
   */
  @property({ type: String, reflect: true }) container?: 'flat';

  /**
   * Sets the rounded visual style of the input.
   */
  @property({ type: Boolean, reflect: true }) rounded = false;

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-search',
    version: 'PACKAGE_VERSION'
  };

  protected get prefixContent() {
    return html`<nve-icon-button icon-name="search" interaction="flat" aria-hidden="true" readonly></nve-icon-button>`;
  }
}

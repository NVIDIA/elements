import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { inputStyles } from '@nvidia-elements/core/input';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './search.css?inline';

/**
 * @element nve-search
 * @description A search is a control that enables users to enter text to search.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/search
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
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get prefixContent() {
    return html`<nve-icon-button icon-name="search" container="inline" aria-hidden="true" readonly></nve-icon-button>`;
  }
}

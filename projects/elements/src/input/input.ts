import type { CSSResult } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import styles from './input.css?inline';

export const inputStyles = styles;

/**
 * @element nve-input
 * @description An input is a control that enables users to enter text.
 * @since 0.3.0
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --cursor
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-input-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
 */
export class Input extends Control implements ContainerElement {
  /**
   * Sets the container type style. Flat is used for inline inputs that are often embeded in other containers or toolbars.
   */
  @property({ type: String, reflect: true }) container?: 'flat';

  /**
   * Sets the rounded visual style of the input.
   */
  @property({ type: Boolean, reflect: true }) rounded = false;

  static styles: CSSResult[] = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-input',
    version: '0.0.0'
  };
}

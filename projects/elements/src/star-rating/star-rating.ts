import { html } from 'lit';
import type { PropertyValues } from 'lit';
import { state } from 'lit/decorators/state.js';
import { useStyles, getElementUpdate } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './star-rating.css?inline';

/**
 * @element nve-star-rating
 * @description A star rating component lets users rate something using stars, providing a quick visual representation of feedback
 * @since 1.23.1
 * @entrypoint \@nvidia-elements/core/star-rating
 * @cssprop --star-size
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-star-rating-documentation--docs
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=10779-25920&p=f&t=jDJwFKeFLq5vTuCH-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range
 * @stable false
 */
export class StarRating extends Control {
  static styles = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-star-rating',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  @state() private min = 0;
  @state() private max = 5;
  @state() private value = 0;
  @state() private active = 0;

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);

    getElementUpdate(this.input, 'max', (max: string) => {
      if (max) {
        this.max = parseInt(max);
      }
    });

    getElementUpdate(this.input, 'min', (min: string) => {
      if (min) {
        this.min = parseInt(min);
      }
    });

    getElementUpdate(this.input, 'value', (value: string) => {
      this.#setValue(value ? parseFloat(value) : this.input.valueAsNumber);
    });

    this.input.addEventListener('input', () => (this.value = this.input.valueAsNumber));

    this.value = this.input.valueAsNumber;
  }

  protected get prefixContent() {
    return html`
    <div aria-hidden="true" class="stars" @mouseleave=${() => (this.active = 0)}>
      ${new Array(this.max).fill('').map((_, i) => {
        const selected = i <= this.value - 1 && this.value > 0;
        return html`
        <nve-icon
          @click=${() => this.#setValue(i + 1)}
          @mouseover=${() => (this.active = i + 1)}
          .name=${(selected && this.active === 0) || i <= this.active - 1 ? 'star' : 'star-stroke'}
        ></nve-icon>
      `;
      })}
    </div>
    `;
  }

  #setValue(value: number) {
    this.input.valueAsNumber = value === this.value ? 0 : value;
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

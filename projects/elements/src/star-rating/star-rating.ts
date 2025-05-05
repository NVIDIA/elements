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
 * @storybook https://NVIDIA.github.io/elements/docs/elements/star-rating/
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
  @state() private precision = 0.5;

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
        const starValue = i + 1;
        const currentValue = this.active || this.value;
        const diff = currentValue - i;

        const iconName = diff >= 1 ? 'star' : diff >= 0.5 ? 'star-half' : 'star-stroke';

        return html`
        <nve-icon
          @click=${() => this.#setValue(this.#getStepValue(i, starValue))}
          @mousemove=${(e: MouseEvent) => this.#handleMouseMove(e, i, starValue)}
          name=${iconName}
        ></nve-icon>
      `;
      })}
    </div>
    `;
  }

  #handleMouseMove(e: MouseEvent, index: number, starValue: number) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;

    this.active = position <= 0.5 ? index + 0.5 : starValue;
  }

  #getStepValue(index: number, starValue: number) {
    // If we're hovering (active is set), use that value
    if (this.active > 0) {
      return this.active;
    }

    // If clicking on the current value, toggle it off
    if (this.value === starValue || this.value === index + 0.5) {
      return 0;
    }

    // Otherwise, return the star value
    return starValue;
  }

  #setValue(value: number) {
    this.input.valueAsNumber = value === this.value ? 0 : value;
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

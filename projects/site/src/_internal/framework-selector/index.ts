import { LitElement, html, css } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

import { frameworkIcons, frameworkOptions } from './frameworks.js';
import type { FrameworkIdentifier, FrameworkOption } from './frameworks.js';

const REPETITIONS = 3;

const CARD_HEIGHT = 64;
const VISIBLE_CARD_COUNT = 5;

const CENTER = (VISIBLE_CARD_COUNT * CARD_HEIGHT) / 2;
const CENTER_INDEX = Math.floor(VISIBLE_CARD_COUNT / 2);
const CENTER_OFFSET = CENTER_INDEX * CARD_HEIGHT;

const AUTO_SCROLL_INTERVAL = 2000;

const MAX_TILT = 15;

const OPTIONS = frameworkOptions;
const OPTION_INDEX_BY_VALUE = OPTIONS.reduce(
  (result, option, index) => {
    result[option.id] = index;
    return result;
  },
  {} as Record<FrameworkIdentifier, number>
);

function getOptionIndex(value: FrameworkIdentifier): number {
  return OPTION_INDEX_BY_VALUE[value];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall > delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  } as T;
}

@customElement('nvd-framework-selector')
export class FrameworkSelector extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 320px;
      height: ${VISIBLE_CARD_COUNT * CARD_HEIGHT}px;

      overflow-y: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }

      scale: 0.9;
      transition: scale cubic-bezier(0.0, 0.0, 0.2, 1) 150ms;
      
      --tilt-x: 0;
      --tilt-y: 0;
      --gradient-angle: 180deg;
      --shadow-percentage: 5%;
      transform: perspective(500px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));

      will-change: scale, transform;
    }

    :host(:focus),
    :host(:hover) {
      scale: 1;
      transition: scale cubic-bezier(0.0, 0.0, 0.2, 1) 150ms;
    }

    [internal-host] {
      display: flex;
      flex-direction: column;
      outline: none;
    }

    nve-card {
      height: ${CARD_HEIGHT}px;

      background: linear-gradient(
        var(--gradient-angle),
        color-mix(in oklch, white 5%, var(--nve-sys-layer-container-background)),
        color-mix(in oklch, var(--nve-sys-layer-canvas-background) var(--shadow-percentage), var(--nve-sys-layer-container-background))
      );

      cursor: pointer;
      user-select: none;

      will-change: opacity, transform;
    }

    .card-content {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: start;
      height: ${CARD_HEIGHT}px;
      gap: 8px;
      padding-left: 16px;     

      font: var(--nve-ref-font-weight-regular) var(--nve-ref-font-size-400) var(--nve-ref-font-family);

      overflow: hidden;
    }
  `;

  static formAssociated = true;

  #internals = this.attachInternals();

  #value: FrameworkIdentifier = OPTIONS[0].id;

  @property({ type: String })
  set value(value: FrameworkIdentifier) {
    this.#value = value;
    this.#internals.setFormValue(value);
  }
  get value(): FrameworkIdentifier {
    return this.#value;
  }

  get form() {
    return this.#internals.form;
  }
  get name() {
    return this.getAttribute('name');
  }
  get type() {
    return this.localName;
  }

  get validationMessage() {
    return this.#internals.validationMessage;
  }
  get willValidate() {
    return this.#internals.willValidate;
  }
  checkValidity() {
    this.#internals.checkValidity();
  }
  reportValidity() {
    this.#internals.reportValidity();
  }

  #hovered: boolean = false;
  #focused: boolean = false;

  get #isInteractive(): boolean {
    return this.#focused || this.#hovered;
  }

  connectedCallback(): void {
    super.connectedCallback();

    globalThis.addEventListener('mousemove', this.#onMouseMove);
    globalThis.addEventListener('keydown', this.#onKeyDown);
    this.addEventListener('wheel', this.#onWheel);
    this.addEventListener('scroll', this.#onScroll);
    this.addEventListener('pointerenter', this.#onPointerEnter);
    this.addEventListener('pointerleave', this.#onPointerLeave);
    this.addEventListener('focus', this.#onFocus);
    this.addEventListener('blur', this.#onBlur);

    this.#updateAutoScroll();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    globalThis.removeEventListener('mousemove', this.#onMouseMove);
    globalThis.removeEventListener('keydown', this.#onKeyDown);
    this.removeEventListener('wheel', this.#onWheel);
    this.removeEventListener('scroll', this.#onScroll);
    this.removeEventListener('pointerenter', this.#onPointerEnter);
    this.removeEventListener('pointerleave', this.#onPointerLeave);
    this.removeEventListener('focus', this.#onFocus);
    this.removeEventListener('blur', this.#onBlur);
  }

  render() {
    return html`
      <div internal-host tabindex="0">
        ${map(range(REPETITIONS), () => OPTIONS.map(this.#renderCard))}
      </div>
      ${frameworkIcons}
    `;
  }

  #renderCard = (option: FrameworkOption) => {
    return html`<nve-card data-id=${option.id} @click=${this.#onCardClick}>
      <div class="card-content">
        <svg width="48" height="48">
          <use href="#${option.id}"></use>
        </svg>
        <span>${option.label}</span>
      </div>
    </nve-card>`;
  };

  updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this.#updateScrollPosition(getOptionIndex(this.#value));
      this.#updateCards();
    }
  }

  #onCardClick = (event: MouseEvent) => {
    const cardEl = event.currentTarget as HTMLElement;
    const steps = Math.round((cardEl.offsetTop - this.scrollTop) / CARD_HEIGHT - CENTER_INDEX);
    this.#scrollBySteps(steps);
  };

  #onMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const { left, top, width, height } = this.getBoundingClientRect();

    const x = ((clientX - left) / width - 0.5) * 2;
    const y = ((clientY - top) / height - 0.5) * 2;

    const tiltX = Math.max(Math.min(-y * MAX_TILT, MAX_TILT), -MAX_TILT);
    const tiltY = Math.max(Math.min(x * MAX_TILT, MAX_TILT), 0);

    const gradientAngle = Math.atan2(tiltY, tiltX) * (180 / Math.PI);
    const tiltMagnitude = Math.sqrt(tiltX ** 2 + tiltY ** 2) / MAX_TILT;

    this.style.setProperty('--tilt-x', `${tiltX}deg`);
    this.style.setProperty('--tilt-y', `${tiltY}deg`);
    this.style.setProperty('--gradient-angle', `${gradientAngle}deg`);
    this.style.setProperty('--shadow-percentage', `${tiltMagnitude * 20}%`);
  };

  #onKeyDown = (event: KeyboardEvent) => {
    if (!this.#isInteractive) {
      return;
    }

    switch (event.key) {
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        event.preventDefault();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.#scrollBySteps(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.#scrollBySteps(1);
        break;
    }
  };

  #onWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!this.#isInteractive) {
      return;
    }

    // NOTE: trackpads report integer deltas
    const isTrackpad = event.deltaMode === 0 && Number.isInteger(event.deltaY);
    if (isTrackpad) {
      if (Math.abs(event.deltaY) < 4) {
        return;
      }
      if (event.deltaY < 0) {
        this.#throttledScrollBySteps(-1);
      } else {
        this.#throttledScrollBySteps(1);
      }
    } else {
      if (event.deltaY < 0) {
        this.#scrollBySteps(-1);
      } else {
        this.#scrollBySteps(1);
      }
    }
  };

  #throttledScrollBySteps = throttle((steps: number) => {
    this.#scrollBySteps(steps);
  }, 100);

  #onScroll = () => {
    this.#updateCards();
  };

  #onPointerEnter = () => {
    this.#hovered = true;
    this.#updateAutoScroll();
  };

  #onPointerLeave = () => {
    this.#hovered = false;
    this.#updateAutoScroll();
  };

  #onFocus = () => {
    this.#focused = true;
    this.#updateAutoScroll();
  };

  #onBlur = () => {
    this.#focused = false;
    this.#updateAutoScroll();
  };

  #autoScrollInterval: ReturnType<typeof setTimeout> | undefined;

  #updateAutoScroll() {
    clearInterval(this.#autoScrollInterval);
    if (!this.#isInteractive) {
      this.#autoScrollInterval = setInterval(() => {
        this.#scrollBySteps(1);
      }, AUTO_SCROLL_INTERVAL);
    }
  }

  #updateCards() {
    const cardEls = this.shadowRoot?.querySelectorAll<HTMLDivElement>('nve-card');
    if (!cardEls) {
      return;
    }

    const scrollTop = this.scrollTop;
    for (const [index, cardEl] of cardEls.entries()) {
      const cardTop = index * CARD_HEIGHT;
      const cardCenter = cardTop + CARD_HEIGHT / 2;

      const centerPosition = scrollTop + CENTER;
      const distanceFromCenter = Math.abs(cardCenter - centerPosition);
      const factor = distanceFromCenter / CENTER;

      const scale = 1 - factor * 0.334;
      const opacity = 1 - factor * 0.334;

      const sign = cardCenter - centerPosition > 0 ? -1 : 1;
      const translateY = scale <= 0.8 ? sign * 12 : 0;

      cardEl.style.transform = `scale(${scale}) translate(0, ${translateY}px)`;
      cardEl.style.opacity = `${opacity}`;
    }
  }

  #updateValue() {
    this.requestUpdate();
    this.#internals.setFormValue(this.#value);
    this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    this.dispatchEvent(new CustomEvent('input', { bubbles: true }));
  }

  #updateScrollPosition(index: number) {
    this.scrollTop = (OPTIONS.length + index) * CARD_HEIGHT - CENTER_OFFSET;
  }

  #scrollBySteps(steps: number) {
    const previousIndex = getOptionIndex(this.#value);
    const index = (previousIndex + steps + OPTIONS.length) % OPTIONS.length;
    this.#updateScrollPosition(previousIndex);
    this.scrollTo({
      top: this.scrollTop + steps * CARD_HEIGHT,
      behavior: 'smooth'
    });
    this.#value = OPTIONS[index].id;
    this.#updateValue();
  }
}

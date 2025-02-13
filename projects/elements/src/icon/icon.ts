import type { PropertyValues } from 'lit';
import { html, isServer, LitElement } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import type { Size } from '@nvidia-elements/core/internal';
import { attachInternals, parseVersion, useStyles } from '@nvidia-elements/core/internal';
import type { IconName, IconSVG } from './icons.js';
import { ICON_IMPORTS } from './icons.js';
import styles from './icon.css?inline';

export type { IconName, IconNames, IconSVG } from './icons.js';

/**
 * @element nve-icon
 * @since 0.1.3
 * @entrypoint \@nvidia-elements/core/icon
 * @description An icon is a graphic symbol designed to visually indicate the purpose of an interface element.
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-icon-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=77-5741&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Icon extends LitElement {
  /**
   * Visual treatment to represent current support status.
   */
  @property({ type: String, reflect: true }) status?: 'warning' | 'danger' | 'success' | 'accent';

  /**
   * Controls the bounding box size of the icon given a t-shirt style value.
   */
  @property({ type: String, reflect: true }) size?: Size | 'xs' | 'xl';

  /**
   * Sets the direction of the icon. Only supported by expand-panel/collapse-panel (horizontal axis) and arrow/caret/chevron icons (4-directions)
   */
  @property({ type: String, reflect: true }) direction?: 'up' | 'down' | 'left' | 'right';

  /**
   * The name of the icon SVG sprite to render.
   */
  @property({ type: String, reflect: true }) name?: IconName;

  @state() private svg: string;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-icon',
    version: '0.0.0'
  };

  static _icons: { [key: string]: IconSVG } = ICON_IMPORTS;

  private static get _iconsRegistry() {
    return this.registeredIcon?._icons ?? Icon._icons;
  }

  private static set _iconsRegistry(icons: { [key: string]: IconSVG }) {
    this.registeredIcon._icons = { ...Icon._iconsRegistry, ...icons };
  }

  private static get registeredIcon() {
    return customElements.get(Icon.metadata.tag) as typeof Icon;
  }

  /** @private */
  declare _internals: ElementInternals;

  get #iconString() {
    return isServer && globalThis._NVE_SSR_ICON_REGISTRY ? globalThis._NVE_SSR_ICON_REGISTRY[this.name] : this.svg;
  }

  render() {
    return html`
      <div internal-host aria-hidden="true"><slot>${unsafeSVG(this.#iconString)}</slot></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'img';
  }

  static async add(icons: { [key: string]: IconSVG }) {
    if (globalThis.customElements?.whenDefined) {
      await globalThis.customElements.whenDefined(Icon.metadata.tag);
      Icon._iconsRegistry = icons;
      Object.keys(icons).forEach(name =>
        globalThis?.document?.dispatchEvent(new CustomEvent(`${Icon.metadata.tag}-${name}`))
      );
    }
  }

  static alias(aliases: { [key: string]: IconName | string }) {
    // whenDefined has no rejection state
    if (globalThis.customElements?.whenDefined) {
      /* eslint-disable @typescript-eslint/no-floating-promises */
      globalThis.customElements.whenDefined(Icon.metadata.tag).then(() => {
        Object.keys(aliases).forEach(alias => {
          Icon._iconsRegistry[alias] = Icon._iconsRegistry[aliases[alias]];
          globalThis.document.dispatchEvent(new CustomEvent(`${Icon.metadata.tag}-${alias}`));
        });
      });
    }
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    await this.#render();

    if (!Icon._iconsRegistry[this.name] || !this.svg) {
      globalThis?.document?.addEventListener(`${Icon.metadata.tag}-${this.name}`, () => this.requestUpdate(), {
        once: true
      });
    }
  }

  async #render() {
    const svg = await (this.name?.endsWith('.svg')
      ? fetch(this.name).then(res => res.text())
      : (Icon._iconsRegistry[this.name]?.svg() ?? Promise.resolve('')));
    Icon._iconsRegistry[this.name] = { svg: () => svg, ...Icon._iconsRegistry[this.name] };
    this.svg = svg;
  }
}

export function mergeIcons(RegisteredIcon: typeof Icon) {
  if (globalThis.customElements?.get) {
    const registered = parseVersion(RegisteredIcon.metadata.version);
    const current = parseVersion('0.0.0');

    // determine if a older icon was registered and if so, merge the icons with the latest svgs
    if (registered.minor <= current.minor && registered.major <= current.major) {
      RegisteredIcon._icons = { ...RegisteredIcon._icons, ...ICON_IMPORTS };
    }
  }
}

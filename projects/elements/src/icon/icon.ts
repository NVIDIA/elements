import { html, LitElement, PropertyValues } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { parseVersion, Size, useStyles } from '@elements/elements/internal';
import { ICON_IMPORTS, IconName, IconSVG } from './icons.js';
import styles from './icon.css?inline';

export type { IconName, IconNames, IconSVG } from './icons.js';

/**
 * @element nve-icon
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-icon-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=77-5741&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Icon extends LitElement {
  /** SVG status color */
  @property({ type: String, reflect: true }) status?: 'warning' | 'danger' | 'success' | 'accent';

  /** SVG size */
  @property({ type: String, reflect: true }) size?: Size | 'xs' | 'xl';

  /**
   * Sets the direction of the icon.
   * Only supported by expand-panel/collapse-panel (horizontal axis) and arrow/caret/chevron icons (4-directions)
   */
  @property({ type: String, reflect: true }) direction?: 'up' | 'down' | 'left' | 'right';

  /** The name of the icon SVG sprite */
  @property({ type: String, reflect: true }) name: IconName;

  @state() private svg: string;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-icon',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <div internal-host>${unsafeSVG(this.svg)}</div>
    `;
  }

  static _icons = ICON_IMPORTS;

  private static get _iconsRegistry() {
    return (customElements.get('nve-icon') as any)?._icons ?? { };
  }

  private static set _iconsRegistry(icons: { [key: string]: IconSVG }) {
    (customElements.get('nve-icon') as any)._icons = { ...Icon._iconsRegistry, ...icons };
  }

  static async add(icons: { [key: string]: IconSVG }) {
    if (globalThis.customElements?.whenDefined) {
      await globalThis.customElements.whenDefined('nve-icon');
      Icon._iconsRegistry = icons;
      Object.keys(icons).forEach(name => globalThis?.document?.dispatchEvent(new CustomEvent(`nve-icon-${name}`)));
    }
  }

  static alias(aliases: { [key: string]: IconName | string }) {
    if (globalThis.customElements?.whenDefined) {
      customElements.whenDefined('nve-icon').then(() => {
        Object.keys(aliases).forEach(alias => {
          const name = aliases[alias];
          Icon._iconsRegistry[alias] = Icon._iconsRegistry[name];
          globalThis.document.dispatchEvent(new CustomEvent(`nve-icon-${alias}`));
        });
      }).catch(e => console.log(`nve-icon was never defined: ${e}`));
    }
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    await this.#render();

    if (!Icon._iconsRegistry[this.name] || !this.svg) {
      globalThis?.document?.addEventListener(`nve-icon-${this.name}`, () => this.requestUpdate(), { once: true });
    }
  }

  async #render() {
    const svg = await (this.name?.endsWith('.svg') ? fetch(this.name).then(res => res.text()) : Icon._iconsRegistry[this.name]?.svg() ?? Promise.resolve(''));
    this.svg = svg;
    await this.updateComplete;
    await new Promise(r => requestAnimationFrame(r));
    Icon._iconsRegistry[this.name] = { svg: () => svg, ...Icon._iconsRegistry[this.name] };
  }
}

export function mergeIcons(RegisteredIcon: typeof Icon) {
  if (globalThis.customElements?.get) {
    const registered = parseVersion(RegisteredIcon.metadata.version);
    const current = parseVersion('PACKAGE_VERSION');

    // determine if a older icon was registered and if so, merge the icons with the latest svgs
    if (registered.minor <= current.minor && registered.major <= current.major) {
      RegisteredIcon._icons = { ...RegisteredIcon._icons, ...ICON_IMPORTS };
    }
  }
}

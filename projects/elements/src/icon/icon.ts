import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { useStyles } from '@elements/elements/internal';
import { ICON_IMPORTS, IconName } from './icons.js';
import styles from './icon.css?inline';

export type { IconName, IconNames } from './icons.js';

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
  @property({ type: String, reflect: true }) size?: 'sm' | 'lg';

  /**
   * Sets the direction of the icon.
   * Only supported by expand-panel/collapse-panel (horizontal axis) and arrow/caret/chevron icons (4-directions)
   */
  @property({ type: String, reflect: true }) direction?: 'up' | 'down' | 'left' | 'right';

  /** The name of the icon SVG sprite */
  @property({ type: String, reflect: true }) name: IconName;

  @state() svg: string;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-icon',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <div internal-host .innerHTML=${this.svg ?? ''}></div>
    `;
  }

  static _icons = ICON_IMPORTS;

  static add(icons: any) {
    const IconDefinition = customElements.get('nve-icon') as any;
    IconDefinition._icons = { ...IconDefinition._icons, ...icons };
    Object.keys(icons).forEach(name => document.dispatchEvent(new CustomEvent(`nve-icon-${name}`)));
  }

  static alias(aliases: { [key: string]: IconName | string }) {
    const IconDefinition = customElements.get('nve-icon') as any;
    Object.keys(aliases).forEach(alias => {
      const name = aliases[alias];
      IconDefinition._icons[alias] = IconDefinition._icons[name];
      document.dispatchEvent(new CustomEvent(`nve-icon-${alias}`));
    });
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    this.svg = await this.#render();
    if (!Icon._icons[this.name] || !this.svg) {
      document.addEventListener(`nve-icon-${this.name}`, () => this.requestUpdate(), { once: true });
    }
  }

  async #render() {
    const dynamic = { svg: () => fetch(this.name).then(res => res.text()) };
    const value = await (this.name?.endsWith('.svg') ? dynamic : Icon._icons[this.name])?.svg() ?? '';
    const svg = typeof value === 'string' ? value : value.default;
    Icon._icons[this.name] = { svg: () => svg as any, ...Icon._icons[this.name] };
    return svg;
  }
}

import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import {
  clickOutsideElementBounds,
  appendRootNodeStyle,
  getFlattenedFocusableItems,
  isSimpleFocusable,
  useStyles
} from '@nvidia-elements/core/internal';
import type { Dropdown } from '@nvidia-elements/core/dropdown';
import globalStyles from './dropdown-group.global.css?inline';

/**
 * @element nve-dropdown-group
 * @description A Dropdown Group streamlines the management of linked dropdowns and supports nested dropdowns for a more organized and intuitive user experience
 * @since 1.30.1
 * @entrypoint \@nvidia-elements/core/dropdown-group
 * @slot - default slot for dropdown content
 * @event open - Dispatched when a dropdown in the group is opened
 * @event close - Dispatched when a dropdown in the group is closed
 * @cssprop --nve-dropdown-group-spacing
 * @cssprop --nve-dropdown-group-transition
 * @storybook https://NVIDIA.github.io/elements/docs/elements/dropdown-group/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 * @stable false
 */
export class DropdownGroup extends LitElement {
  static styles = useStyles([]);

  static readonly metadata = {
    tag: 'nve-dropdown-group',
    version: '0.0.0'
  };

  @queryAssignedElements() protected dropdowns!: Dropdown[];

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${this.#syncDropdowns}></slot>
      </div>
    `;
  }

  #_pointerup = e => this.#pointerup(e);

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    globalThis.document?.addEventListener('pointerup', this.#_pointerup);
    this.addEventListener('keydown', this.#keydown);
    this.addEventListener('open', this.#onOpen);
    this.addEventListener('close', this.#onClose);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    globalThis.document?.removeEventListener('pointerup', this.#_pointerup);
  }

  #syncDropdowns() {
    this.dropdowns.forEach(dropdown => {
      dropdown.popoverType = 'manual';
    });
  }

  #pointerup(event: PointerEvent) {
    const multipleDropdownsOpen = this.dropdowns.some(dropdown => dropdown.matches(':popover-open'));
    const pointerIsOutsideGroup = this.dropdowns.every(dropdown => clickOutsideElementBounds(event, dropdown));
    if (multipleDropdownsOpen && pointerIsOutsideGroup) {
      this.close();
    }
  }

  #keydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (event.code === 'Escape') {
      this.close();
    }
    if (event.code === 'ArrowRight') {
      const targetId = target.getAttribute('popovertarget');
      const dropdown = this.dropdowns.find(dropdown => dropdown.id === targetId);
      dropdown?.showPopover();
    }
    if (event.code === 'ArrowLeft' && isSimpleFocusable(event.target as HTMLElement)) {
      target.closest('nve-dropdown')?.hidePopover();
    }
  }

  #onOpen(event: CustomEvent) {
    const dropdown = event.target as HTMLElement;
    const isLocalDropdown = dropdown.localName === 'nve-dropdown' && this.dropdowns.find(d => d === dropdown);
    if (isLocalDropdown) {
      getFlattenedFocusableItems(dropdown)[0]?.focus();
    }
  }

  #onClose(event: CustomEvent) {
    const element = event.target as HTMLElement;
    const isLocalDropdown = element.localName === 'nve-dropdown' && this.dropdowns.find(d => d === element);
    if (isLocalDropdown) {
      // _activeTrigger is a popover controller internal API
      const dropdown = element as Dropdown & { _activeTrigger?: HTMLElement };
      dropdown._activeTrigger?.focus();
    }
  }

  close() {
    this.querySelectorAll('nve-dropdown').forEach(d => d.hidePopover());
  }
}

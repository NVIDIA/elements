import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { state } from 'lit/decorators/state.js';
import {
  attachInternals,
  audit,
  generateId,
  sameOrderedStringArray,
  setHiddenAndAriaHidden,
  uniqueNonEmptyStrings,
  useStyles
} from '@nvidia-elements/core/internal';
import type { TabsItem } from './tabs.js';
import styles from './tabs-group.css?inline';

type TabsGroupCommandSource = HTMLElement & {
  disabled?: boolean;
  value?: string | null;
};

type TabsGroupCommandEvent = Event & {
  command?: string;
  source?: TabsGroupCommandSource | null;
};

/** Options for observing dynamic changes under the slotted `nve-tabs` subtree. */
const TABS_SUBTREE_OBSERVER_INIT: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['disabled', 'id', 'selected', 'value']
};

/**
 * @element nve-tabs-group
 * @description Coordinates tabs with matching panel content using Invoker Commands and slot-matched panels.
 * @since 1.67.0
 * @entrypoint \@nvidia-elements/core/tabs
 * @command --toggle - Select the matching tab and reveal the panel whose slot matches the invoker value.
 * @event select - Dispatched when the selected tab value changes after an invoker `--toggle` updates selection
 * @slot - Default slot for a single nve-tabs element. Do not use behavior-select on nve-tabs when using this group.
 * @slot {value} - Named panel content where the slot name matches a nve-tabs-item value.
 * @cssprop --padding
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @responsive false
 */
@audit()
export class TabsGroup extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-tabs-group',
    version: '0.0.0',
    children: ['nve-tabs']
  };

  @queryAssignedElements({ flatten: true }) private defaultSlotElements!: HTMLElement[];

  @state() private panelValues: string[] = [];

  @state() private selectedValue = '';

  /** @private */
  declare _internals: ElementInternals;

  #tabsObserver?: MutationObserver;

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${this.#handleDefaultSlotChange}></slot>
        ${this.panelValues.map(value => html`<slot name=${value} @slotchange=${this.#handlePanelSlotChange}></slot>`)}
      </div>
    `;
  }

  // --- Lifecycle & command ---

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
    this.addEventListener('command', this.#handleCommand as EventListener);
  }

  firstUpdated() {
    void this.updateComplete.then(() => {
      if (!this.isConnected) {
        return;
      }

      this.#syncFromTabs();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('command', this.#handleCommand as EventListener);
    this.#tabsObserver?.disconnect();
  }

  updated(changedProperties: Map<PropertyKey, unknown>) {
    if (!this.#tabsObserver) {
      this.#observeTabs();
    }

    if (changedProperties.has('panelValues') || changedProperties.has('selectedValue')) {
      this.#syncPanels();
    }
  }

  #handleDefaultSlotChange = () => {
    this.#observeTabs();
    this.#syncFromTabs();
  };

  #handlePanelSlotChange = () => {
    this.#syncPanels();
  };

  #handleCommand = (event: TabsGroupCommandEvent) => {
    if (event.command !== '--toggle') {
      return;
    }

    const value = event.source?.value;
    if (typeof value !== 'string' || !value.length) {
      return;
    }

    const tabItems = this.#getTabItems();
    const tabItem = tabItems.find(item => this.#isSelectableTab(item) && item.value === value);
    if (!tabItem) {
      return;
    }

    this.#setActiveTab(tabItems, tabItem, true);
  };

  // --- Tab strip sync (tabs → state) ---

  #observeTabs() {
    this.#tabsObserver?.disconnect();

    const tabs = this.#getTabsElement();
    if (!tabs) {
      return;
    }

    this.#tabsObserver = new MutationObserver(() => this.#syncFromTabs());
    this.#tabsObserver.observe(tabs, TABS_SUBTREE_OBSERVER_INIT);
  }

  #syncFromTabs() {
    const tabItems = this.#getTabItems();
    const nextPanelValues = uniqueNonEmptyStrings(tabItems.map(item => item.value));

    const selectedTab = this.#resolveSelectedTab(tabItems);

    if (!selectedTab) {
      tabItems.forEach(item => (item.selected = false));
      this.#commitState(nextPanelValues, '');
      return;
    }

    this.#setActiveTab(tabItems, selectedTab, false, nextPanelValues);
  }

  #setActiveTab(
    tabItems: TabsItem[],
    nextTab: TabsItem,
    emitEvent: boolean,
    nextPanelValues = uniqueNonEmptyStrings(tabItems.map(item => item.value))
  ) {
    // True when the effective selection differs from the prior committed state (value, flags, or multi-select).
    // `select` is only dispatched when both `emitEvent` (invoker/command path) and `changed` are true.
    const changed =
      this.selectedValue !== nextTab.value ||
      !nextTab.selected ||
      tabItems.some(item => item !== nextTab && item.selected);

    tabItems.forEach(item => {
      item.selected = item === nextTab;
    });

    this.#commitState(nextPanelValues, nextTab.value);

    if (emitEvent && changed) {
      this.dispatchEvent(
        new CustomEvent<{ value: string }>('select', {
          bubbles: true,
          composed: true,
          detail: { value: nextTab.value }
        })
      );
    }
  }

  #commitState(nextPanelValues: string[], nextSelectedValue: string) {
    if (!sameOrderedStringArray(this.panelValues, nextPanelValues)) {
      this.panelValues = nextPanelValues;
    }

    if (this.selectedValue !== nextSelectedValue) {
      this.selectedValue = nextSelectedValue;
    }
  }

  // --- Panel sync (state → panels & ARIA) ---

  #syncPanels() {
    const tabItems = this.#getTabItems();
    const tabMap = new Map(
      tabItems.filter(item => this.#isSelectableTab(item)).map(item => [item.value, item] satisfies [string, TabsItem])
    );

    this.#getPanelSlots().forEach(slot => {
      this.#syncPanelSlot(slot, tabMap);
    });
  }

  #syncPanelSlot(slot: HTMLSlotElement, tabMap: Map<string, TabsItem>) {
    const tabItem = tabMap.get(slot.name);
    const panels = slot.assignedElements({ flatten: true }) as HTMLElement[];

    if (!tabItem) {
      panels.forEach(panel => {
        setHiddenAndAriaHidden(panel, true);
      });
      return;
    }

    tabItem.id ||= generateId();

    panels.forEach((panel, index) => {
      panel.id ||= generateId();

      if (!tabItem.hasAttribute('aria-controls') && index === 0) {
        tabItem.setAttribute('aria-controls', panel.id);
      }

      if (!panel.hasAttribute('aria-labelledby')) {
        panel.setAttribute('aria-labelledby', tabItem.id);
      }

      if (!panel.hasAttribute('role')) {
        panel.setAttribute('role', 'tabpanel');
      }

      const isActive = slot.name === this.selectedValue;
      setHiddenAndAriaHidden(panel, !isActive);
    });
  }

  // --- DOM queries ---

  #getTabsElement(): HTMLElement | undefined {
    return (
      this.defaultSlotElements.find(element => element.localName === 'nve-tabs') ??
      this.querySelector('nve-tabs') ??
      undefined
    );
  }

  #getTabItems(): TabsItem[] {
    return Array.from(this.#getTabsElement()?.querySelectorAll<TabsItem>('nve-tabs-item') ?? []);
  }

  #getPanelSlots(): HTMLSlotElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLSlotElement>('slot[name]'));
  }

  #isSelectableTab(tabItem: TabsItem) {
    return typeof tabItem.value === 'string' && tabItem.value.length > 0 && !tabItem.disabled;
  }

  /** Prefer the selectable tab that is already selected; otherwise the first selectable tab. */
  #resolveSelectedTab(tabItems: TabsItem[]): TabsItem | undefined {
    return (
      tabItems.find(item => this.#isSelectableTab(item) && item.selected) ??
      tabItems.find(item => this.#isSelectableTab(item))
    );
  }
}

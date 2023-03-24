import { define } from '@elements/elements/internal';
import { TabsItem, Tabs } from '@elements/elements/tabs';

define(TabsItem);
define(Tabs);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-tabs-item': TabsItem;
    'mlv-tabs': Tabs;
  }
}

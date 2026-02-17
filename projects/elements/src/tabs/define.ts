import { define } from '@nvidia-elements/core/internal';
import { TabsItem, Tabs } from '@nvidia-elements/core/tabs';

define(TabsItem);
define(Tabs);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tabs-item': TabsItem;
    'nve-tabs': Tabs;
  }
}

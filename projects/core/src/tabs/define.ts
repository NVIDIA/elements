import { define } from '@nvidia-elements/core/internal';
import { TabsGroup, TabsItem, Tabs } from '@nvidia-elements/core/tabs';

define(TabsItem);
define(Tabs);
define(TabsGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-tabs-item': TabsItem;
    'nve-tabs': Tabs;
    'nve-tabs-group': TabsGroup;
  }
}

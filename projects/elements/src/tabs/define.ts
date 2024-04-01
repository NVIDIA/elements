import { define } from '@nvidia-elements/core/internal';
import { TabsItem, Tabs } from '@nvidia-elements/core/tabs';

define(TabsItem);
define(Tabs);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-tabs-item': TabsItem;
    'mlv-tabs': Tabs;
  }
}

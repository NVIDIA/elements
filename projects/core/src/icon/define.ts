import { define } from '@nvidia-elements/core/internal';
import { Icon, mergeIcons } from '@nvidia-elements/core/icon';

define(Icon);
if (customElements.get(Icon.metadata.tag)) {
  mergeIcons(customElements.get(Icon.metadata.tag) as typeof Icon);
}

/** @deprecated aliases */
Icon.alias({
  'chevron-right': 'chevron',
  'chevron-down': 'chevron',
  'chevron-left': 'chevron',
  'additional-actions': 'more-actions',
  analytics: 'pie-chart',
  annotation: 'transparent-box',
  'app-switcher': 'switch-apps',
  assist: 'chat-bubble',
  checkmark: 'check',
  date: 'calendar',
  docs: 'book',
  'expand-full-screen': 'maximize',
  'expand-panel': 'arrow-stop',
  'collapse-panel': 'arrow-stop',
  failed: 'x-circle',
  'favorite-filled': 'star',
  'favorite-outline': 'star-stroke',
  information: 'information-circle-stroke',
  maintenance: 'wrench',
  'navigate-to': 'arrow',
  'open-external-link': 'arrow-angle',
  location: 'map-pin',
  'pinned-1': 'pin',
  project: 'folder',
  settings: 'gear',
  user: 'person',
  'video-pause': 'pause',
  'video-play': 'play',
  'video-stop': 'stop',
  visible: 'eye',
  warning: 'exclamation-triangle'
});

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}

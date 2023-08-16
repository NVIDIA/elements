import { define, parseVersion } from '@elements/elements/internal';
import { ICON_IMPORTS, Icon } from '@elements/elements/icon';

define(Icon);

if (globalThis.customElements?.get) {
  const RegisteredIcon = customElements.get('nve-icon') as typeof Icon;
  const registered = parseVersion(RegisteredIcon.metadata.version);
  const current = parseVersion('PACKAGE_VERSION');

  // determine if a older icon was registered and if so, merge the icons with the latest svgs
  if (registered.minor <= current.minor && registered.major <= current.major) {
    RegisteredIcon._icons = { ...RegisteredIcon._icons, ...ICON_IMPORTS };
  }
}

/** @deprecated aliases */
Icon.alias({
  'chevron-up': 'chevron',
  'chevron-right': 'chevron',
  'chevron-down': 'chevron',
  'chevron-left': 'chevron',
  'additional-actions': 'more-actions',
  'analytics': 'pie-chart',
  'annotation': 'transparent-box',
  'app-switcher': 'switch-apps',
  'assist': 'chat-bubble',
  'attached': 'paper-clip',
  'breadcrumb': 'checron-right',
  'category-list': 'bars-3-bottom-left',
  'checkmark': 'check',
  'chop': 'scissors',
  'collection': 'rectangle-stack-vertical',
  'dark-mode': 'moon',
  'dashboard': 'add-grid',
  'date': 'calendar',
  'docs': 'book',
  'domains': 'globe-alt-stroke',
  'expand-full-screen': 'maximize',
  'expand': 'maximize',
  'expand-panel': 'arrow-stop',
  'collapse-panel': 'arrow-stop',
  'failed-badge': 'x-circle',
  'failed': 'x-circle',
  'favorite-filled': 'star',
  'favorite-outline': 'star-stroke',
  'feedback': 'megaphone',
  'filter-ouline': 'filter-stroke',
  'flagged': 'flag',
  'free-text': 'edit',
  'help': 'question-mark-circle',
  'hidden': 'eye-hidden',
  'important-badge': 'exclamation-circle',
  'inbox-1': 'carousel-vertical',
  'information': 'information-circle-stroke',
  'interaction': 'cursor-rays',
  'light-mode': 'sun',
  'mail': 'envelope',
  'maintenance': 'wrench',
  'minus-badge': 'miunus-circle',
  'navigate-back': 'arrow',
  'navigate-to': 'arrow',
  'notification': 'bell',
  'obstacle': 'traffic-cone',
  'open-external-link': 'arrow-angle',
  'organization': 'office-building',
  'pan': 'hand',
  'passed-or-success': 'checkmark-circle',
  'location': 'map-pin',
  'pinned-1': 'pin',
  'plugin-store': 'plug',
  'plugins': 'plug',
  'plus-badge': 'plus-circle',
  'plus': 'add',
  'project': 'folder',
  'refresh-1': 'redo',
  'retry': 'redo',
  'reset': 'undo',
  'schedule': 'clock',
  'set-priority': 'chart-bar',
  'settings': 'gear',
  'shortcut': 'lightning-bolt',
  'success-badge': 'checkmark-circle',
  'support': 'chat-bubble',
  'system-status': 'chip',
  'transparency': 'circle-half',
  'team': 'person-3',
  'user': 'person',
  'video-pause': 'pause',
  'video-play': 'play',
  'video-stop': 'stop',
  'view-as-list': 'bars-4',
  'view-as-table-outline': 'table',
  'visible': 'eye',
  'warning': 'exclamation-triangle',
  'tutorial': 'academic-cap',
  'debugging': 'bug',
  'insights': 'projector',
  'beginning': 'arrow-stop',
  'end': 'arrow-stop',
  'carousel-vertical': 'carousel',
  'carousel-horizontal': 'carousel',
  'thumbs-down-stroke': 'thumb-stroke',
  'thumbs-down': 'thumb',
  'thumbs-up-stroke': 'thumb-stroke',
  'thumbs-up': 'thumb',
});

declare global {
  interface HTMLElementTagNameMap {
    'nve-icon': Icon;
  }
}

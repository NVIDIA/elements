import { define } from '@nvidia-elements/core/internal';
import { Panel, PanelHeader, PanelContent, PanelFooter } from '@nvidia-elements/core/panel';
import '@nvidia-elements/core/icon-button/define.js';

define(Panel);
define(PanelHeader);
define(PanelContent);
define(PanelFooter);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-panel': Panel;
    'mlv-panel-header': PanelHeader;
    'mlv-panel-content': PanelContent;
    'mlv-panel-footer': PanelFooter;
  }
}

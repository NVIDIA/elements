import { define } from '@elements/elements/internal';
import { Panel, PanelHeader, PanelContent, PanelFooter } from '@elements/elements/panel';
import '@elements/elements/icon-button/define.js';

define(Panel);
define(PanelHeader);
define(PanelContent);
define(PanelFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-panel': Panel;
    'nve-panel-header': PanelHeader;
    'nve-panel-content': PanelContent;
    'nve-panel-footer': PanelFooter;
  }
}

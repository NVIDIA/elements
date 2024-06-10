import { define } from '@nvidia-elements/core/internal';
import { Panel, PanelHeader, PanelContent, PanelFooter } from '@nvidia-elements/core/panel';
import '@nvidia-elements/core/icon-button/define.js';

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
    'nve-panel': Panel /** @depreacated */;
    'nve-panel-header': PanelHeader /** @depreacated */;
    'nve-panel-content': PanelContent /** @depreacated */;
    'nve-panel-footer': PanelFooter /** @depreacated */;
  }
}

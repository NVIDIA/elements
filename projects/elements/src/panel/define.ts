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
    'mlv-panel': Panel /** @depreacated */;
    'mlv-panel-header': PanelHeader /** @depreacated */;
    'mlv-panel-content': PanelContent /** @depreacated */;
    'mlv-panel-footer': PanelFooter /** @depreacated */;
  }
}

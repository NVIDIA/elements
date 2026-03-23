import { define } from '@nvidia-elements/core/internal';
import { Panel, PanelHeader, PanelContent, PanelFooter } from '@nvidia-elements/core/panel';

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

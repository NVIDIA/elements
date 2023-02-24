import { define } from '@elements/elements/internal';
import { Panel, PanelHeader, PanelContent, PanelFooter } from '@elements/elements/panel';

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

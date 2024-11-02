import { define, TransitionService } from '@nvidia-elements/core/internal';
import { Page, PagePanel, PagePanelContent, PagePanelFooter, PagePanelHeader } from '@nvidia-elements/core/page';
import '@nvidia-elements/core/icon-button/define.js';

define(Page);
define(PagePanel);
define(PagePanelFooter);
define(PagePanelHeader);
define(PagePanelContent);

TransitionService.enable();

declare global {
  interface HTMLElementTagNameMap {
    'nve-page': Page;
    'nve-page-panel': PagePanel;
    'nve-page-panel-footer': PagePanelFooter;
    'nve-page-panel-header': PagePanelHeader;
    'nve-page-panel-content': PagePanelContent;
  }
}

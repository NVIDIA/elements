import { define } from '@elements/elements/internal';
import { Accordion, AccordionHeader, AccordionContent, AccordionGroup } from '@elements/elements/accordion';
import '@elements/elements/icon-button/define.js';

define(Accordion);
define(AccordionHeader);
define(AccordionContent);
define(AccordionGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-accordion': Accordion;
    'nve-accordion-header': AccordionHeader;
    'nve-accordion-content': AccordionContent;
    'nve-accordion-group': AccordionGroup;
  }
}

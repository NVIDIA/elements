import { define } from '@elements/elements/internal';
import { Accordion, AccordionHeader, AccordionContent, AccordionGroup } from '@elements/elements/accordion';
import '@elements/elements/icon-button/define.js';

define(Accordion);
define(AccordionHeader);
define(AccordionContent);
define(AccordionGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-accordion': Accordion;
    'mlv-accordion-header': AccordionHeader;
    'mlv-accordion-content': AccordionContent;
    'mlv-accordion-group': AccordionGroup;
  }
}

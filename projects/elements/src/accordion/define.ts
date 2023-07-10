import { define } from '@elements/elements/internal';
import { Accordion, AccordionHeader, AccordionContent } from '@elements/elements/accordion';
import '@elements/elements/icon-button/define.js';

define(Accordion);
define(AccordionHeader);
define(AccordionContent);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-accordion': Accordion;
    'mlv-accordion-header': AccordionHeader;
    'mlv-accordion-content': AccordionContent;
  }
}

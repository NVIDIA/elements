import { define } from '@elements/elements/internal';
import { Accordion, AccordionHeader, AccordionContent } from '@elements/elements/accordion';

define(Accordion);
define(AccordionHeader);
define(AccordionContent);

declare global {
  interface HTMLElementTagNameMap {
    'nve-accordion': Accordion;
    'nve-accordion-header': AccordionHeader;
    'nve-accordion-content': AccordionContent;
  }
}

import { define } from '@nvidia-elements/core/internal';
import { Accordion, AccordionHeader, AccordionContent, AccordionGroup } from '@nvidia-elements/core/accordion';
import '@nvidia-elements/core/icon-button/define.js';

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
    'mlv-accordion': Accordion;
    'mlv-accordion-header': AccordionHeader;
    'mlv-accordion-content': AccordionContent;
    'mlv-accordion-group': AccordionGroup;
  }
}

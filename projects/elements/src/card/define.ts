import { defineElement } from '@elements/elements/internal';
import { Card, CardHeader, CardContent, CardFooter } from '@elements/elements/card';

defineElement('nve-card', Card);
defineElement('nve-card-header', CardHeader);
defineElement('nve-card-content', CardContent);
defineElement('nve-card-footer', CardFooter);

declare global {
  interface HTMLElementTagNameMap {
    'nve-card': Card;
    'nve-card-header': CardHeader;
    'nve-card-content': CardContent;
    'nve-card-footer': CardFooter;
  }
}

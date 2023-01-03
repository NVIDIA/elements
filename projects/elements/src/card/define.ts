import { defineElement } from '@elements/elements/internal';
import { Card, CardHeader, CardContent, CardFooter } from '@elements/elements/card';

defineElement('mlv-card', Card);
defineElement('mlv-card-header', CardHeader);
defineElement('mlv-card-content', CardContent);
defineElement('mlv-card-footer', CardFooter);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-card': Card;
    'mlv-card-header': CardHeader;
    'mlv-card-content': CardContent;
    'mlv-card-footer': CardFooter;
  }
}

import { define } from '@elements/elements/internal';
import { Card, CardHeader, CardContent, CardFooter } from '@elements/elements/card';

define(Card);
define(CardHeader);
define(CardContent);
define(CardFooter);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-card': Card;
    'mlv-card-header': CardHeader;
    'mlv-card-content': CardContent;
    'mlv-card-footer': CardFooter;
  }
}

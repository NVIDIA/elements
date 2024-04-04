import { define } from '@nvidia-elements/core/internal';
import { StepperItem, Stepper } from '@nvidia-elements/core/stepper';

define(StepperItem);
define(Stepper);

declare global {
  interface HTMLElementTagNameMap {
    'nve-stepper-item': StepperItem;
    'nve-stepper': Stepper;
  }
}

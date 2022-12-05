import { Input, InputGroup } from '@elements/elements/input';
import '@elements/elements/forms/define.js';

customElements.get('mlv-input') || customElements.define('mlv-input', Input);
customElements.get('mlv-input-group') || customElements.define('mlv-input-group', InputGroup);

declare global {
  interface HTMLElementTagNameMap {
    'mlv-input': Input;
    'mlv-input-group': InputGroup;
  }
}

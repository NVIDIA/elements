import { Input, InputGroup } from '@elements/elements/input';
import '@elements/elements/forms/define.js';

customElements.get('nve-input') || customElements.define('nve-input', Input);
customElements.get('nve-input-group') || customElements.define('nve-input-group', InputGroup);

declare global {
  interface HTMLElementTagNameMap {
    'nve-input': Input;
    'nve-input-group': InputGroup;
  }
}

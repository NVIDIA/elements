import { html } from 'lit';
import { VERSION } from '../index.js';

export default {
  title: 'Labs/Forms/Examples'
};

export const Default = {
  render: () => html`
<p>Forms v${VERSION}</p>
`
};

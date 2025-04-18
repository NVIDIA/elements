import { html } from 'lit';
import { VERSION } from '../index.js';

export default {
  title: 'Labs/Entity/Examples',
  component: 'avi-light-card'
};

export const Default = {
  render: () => html`
<p>Entity v${VERSION}</p>
`
};

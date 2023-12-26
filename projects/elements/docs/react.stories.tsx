import React from 'react';
import { render } from 'react-dom';
import { createComponent } from '@lit-labs/react';
import { Button } from '@elements/elements/button';

export default {
  title: 'Internal/Integration'
};

const MlvButton = createComponent(React, 'nve-button', Button);

export const ReactExample = () => {
  setTimeout(() => render(<MlvButton>react button</MlvButton>, document.getElementById('react-root')));
  return `<div id="react-root"></div>`;
};

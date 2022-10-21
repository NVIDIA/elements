import React from 'react';
import { render } from 'react-dom';
import { createComponent } from '@lit-labs/react';
import { Button } from '@elements/elements/button';

export default {
  title: 'Internal/Examples/Integration/React'
};

const MlvButton = createComponent(React, 'mlv-button', Button);

export const Demo = () =>{
  setTimeout(() => render(<MlvButton>react button</MlvButton>, document.getElementById('react-root')));
  return `<div id="react-root"></div>`;
};

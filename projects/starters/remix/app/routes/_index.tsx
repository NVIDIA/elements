import React from 'react';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/tooltip/define.js';

export default function Home() {
  return (
    <div>
      <nve-button onClick={() => console.log('click')} aria-label="test" popovertarget="tooltip" interaction="emphasis">
        button
      </nve-button>
      <nve-tooltip id="tooltip" onclose={() => console.log('close')} onopen={() => console.log('open')}>
        tooltip
      </nve-tooltip>
      <nve-alert status="success">
        hello there from Elements version {globalThis?.NVE_ELEMENTS?.state?.versions[0]} in React version{' '}
        {React.version}
      </nve-alert>
    </div>
  );
}

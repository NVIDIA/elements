import React from 'react';
import { MlvButton } from '@elements/elements-react/button';
import { MlvAlert } from '@elements/elements-react/alert';
import { MlvDialog } from '@elements/elements-react/dialog';

function App() {
  const [showDialog, setshowDialog] = React.useState(false);

  return (
    <div mlv-layout="column gap:md align:center" style={{ height: '95vh' }}>
      <h1 mlv-text="heading">React</h1>

      <MlvButton onClick={() => setshowDialog(!showDialog)}>greeting</MlvButton>

      <MlvDialog closable modal hidden={!showDialog} onclose={() => setshowDialog(false)}>
        <MlvAlert status="success">hello there</MlvAlert>
      </MlvDialog>
    </div>
  );
}

export default App;

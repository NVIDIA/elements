import type { Dialog } from '@elements/elements/dialog';
import type { Button } from '@elements/elements/button';
import '@elements/elements/button/define.js';
import '@elements/elements/dialog/define.js';
import './index.css';

const dialog = document.querySelector<Dialog>('nve-dialog');
const button = document.querySelector<Button>('nve-button');

if (button && dialog) {
  button.addEventListener('click', () => dialog.hidden = false);
  dialog.addEventListener('close', () => dialog.hidden = true);
}
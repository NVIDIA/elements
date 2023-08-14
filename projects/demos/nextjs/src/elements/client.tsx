import React from 'react';
import { createComponent } from '@lit-labs/react';
import dynamic from 'next/dynamic';

/**
 * This approach will load and render elements on the client side only.
 */

export const MlvButton = dynamic(async () => {
  import('@elements/elements/button/define.js');
  const { Button } = await import('@elements/elements/button');
  return createComponent({ react: React, tagName: Button.metadata.tag, elementClass: Button });
}, { ssr: false });

export const MlvAlert = dynamic(async () => {
  import('@elements/elements/alert/define.js');
  const { Alert } = await import('@elements/elements/alert');
  return createComponent({ react: React, tagName: Alert.metadata.tag, elementClass: Alert });
}, { ssr: false });

export const MlvDialog = dynamic(async () => {
  import('@elements/elements/dialog/define.js');
  const { Dialog } = await import('@elements/elements/dialog');
  return createComponent({ react: React, tagName: Dialog.metadata.tag, elementClass: Dialog, events: { onclose: 'close' } });
}, { ssr: false });

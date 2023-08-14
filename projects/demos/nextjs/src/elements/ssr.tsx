import React from 'react';
import { createComponent } from '@lit-labs/react';
import { Button } from '@elements/elements/button';
import { Alert } from '@elements/elements/alert';
import { Dialog } from '@elements/elements/dialog';
import '@elements/elements/button/define.js';
import '@elements/elements/alert/define.js';
import '@elements/elements/dialog/define.js';

/**
 * This approach uses standard React components + the @lit-labs/nextjs plugin for partial SSR
 * See the next.config.cjs file for more details.
 */

export const MlvButton = createComponent({ react: React, tagName: Button.metadata.tag, elementClass: Button });
export const MlvAlert = createComponent({ react: React, tagName: Alert.metadata.tag, elementClass: Alert });
export const MlvDialog = createComponent({ react: React, tagName: Dialog.metadata.tag, elementClass: Dialog, events: { onclose: 'close' } });

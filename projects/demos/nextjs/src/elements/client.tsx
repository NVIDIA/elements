import dynamic from 'next/dynamic';

/**
 * This approach will load and render elements on the client side only.
 */
export const MlvButton = dynamic(async () => (await import('@elements/elements-react/button')).MlvButton, { ssr: false });
export const MlvAlert = dynamic(async () => (await import('@elements/elements-react/alert')).MlvAlert, { ssr: false });
export const MlvDialog = dynamic(async () => (await import('@elements/elements-react/dialog')).MlvDialog, { ssr: false });

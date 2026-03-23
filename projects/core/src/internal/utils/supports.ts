export function supportsNativeCSSAnchorPosition() {
  return globalThis.CSS?.supports?.('position-area', 'top') || globalThis.CSS?.supports?.('inset-area', 'top');
}

export function supportsCSSPositionArea() {
  return globalThis.CSS?.supports?.('position-area', 'top');
}

export function supportsCSSLegacyInsetArea() {
  return globalThis.CSS?.supports?.('inset-area', 'top');
}

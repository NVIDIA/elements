export function getDevicePixelSize(
  entry: ResizeObserverEntry,
  devicePixelRatio: number
): { width: number; height: number } {
  const fallback = {
    width: entry.contentRect.width * devicePixelRatio,
    height: entry.contentRect.height * devicePixelRatio
  };
  const devicePixels = entry.devicePixelContentBoxSize?.[0];
  return devicePixels && sizesApproximatelyEqual(devicePixels, fallback)
    ? { width: devicePixels.inlineSize, height: devicePixels.blockSize }
    : fallback;
}

function sizesApproximatelyEqual(
  devicePixels: ResizeObserverSize,
  fallback: { width: number; height: number }
): boolean {
  return (
    Math.abs(devicePixels.inlineSize - fallback.width) <= 1 && Math.abs(devicePixels.blockSize - fallback.height) <= 1
  );
}

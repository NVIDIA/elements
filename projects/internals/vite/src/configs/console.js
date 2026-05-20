const expectedTestConsoleMessages = [
  'plugin vite-plugin-virtual-html',
  'ElementInternals.checkValidity() was called on the server.This method always returns true.'
];

function isExpectedTestConsoleMessage(log) {
  if (expectedTestConsoleMessages.some(message => log.includes(message))) {
    return true;
  }

  return false;
}

export function hideExpectedTestConsoleMessage(log) {
  if (isExpectedTestConsoleMessage(log)) {
    return false;
  }
}

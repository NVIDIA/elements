const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3000);
const LATEST_URL = 'https://https://esm.sh/@nvidia-elements/core@latest/package.json';

export const ESM_ELEMENTS_VERSION = await fetch(LATEST_URL, { signal: controller.signal })
  .then(async response => {
    clearTimeout(timeout);
    return (await response.json()).version;
  })
  .catch(() => {
    console.warn('Could not featch latest version from https://https://esm.sh');
    return '0.0.0';
  });

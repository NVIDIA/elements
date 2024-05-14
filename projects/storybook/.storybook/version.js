
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3000);
const LATEST_URL = 'https://https://esm.sh/@elements/elements@latest/package.json';

export const ELEMENTS_VERSION = await fetch(LATEST_URL, { signal: controller.signal }).then(async (response) => {
  clearTimeout(timeout);
  return (await response.json()).version;
}).catch(() => {
  console.warn('Could not featch latest version from https://https://esm.sh');
  return '0.0.0';
});

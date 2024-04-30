
export const ELEMENTS_VERSION = (await fetch('https://esm.nvidia.com/@elements/elements@latest/package.json').then(r => r.json())).version;
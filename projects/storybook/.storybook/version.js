
export const ELEMENTS_VERSION = (await fetch('https://https://esm.sh/@elements/elements@latest/package.json').then(r => r.json())).version;
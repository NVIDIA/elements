export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function isObjectLiteral(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }
  const proto = Object.getPrototypeOf(item);
  return proto === null || proto === Object.prototype;
}

export function deepMerge(target, ...sources) {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (isObject(target[key])) {
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

export function parseVersion(version: string) {
  const [major, minor, patch] = version.split('.').map(v => parseInt(v, 10));
  return { major: major ? major : -1, minor: minor ? minor : -1, patch: patch ? patch : -1 };
}

export function formatStandardNumber(number: number) {
  return new Intl.NumberFormat().format(number);
}

export function getDifference(minuend: number, subtrahend: number) {
  return Math.sign(subtrahend - minuend) * Math.abs(minuend - subtrahend);
}

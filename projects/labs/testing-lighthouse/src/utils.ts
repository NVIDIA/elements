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

export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

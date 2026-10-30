const fields = {
  layoutCount: ['LayoutCount', 1],
  styleRecalcCount: ['RecalcStyleCount', 1],
  layoutDurationMs: ['LayoutDuration', 1000],
  styleRecalcDurationMs: ['RecalcStyleDuration', 1000]
};

export function metricDelta(before, after) {
  const read = (snapshot, name) => {
    const value = snapshot.metrics.find(metric => metric.name === name)?.value;
    if (!Number.isFinite(value) || value < 0) throw new Error(`Required Chromium metric ${name} is missing or invalid`);
    return value;
  };
  return Object.fromEntries(
    Object.entries(fields).map(([key, [name, scale]]) => {
      const delta = (read(after, name) - read(before, name)) * scale;
      if (!Number.isFinite(delta) || delta < 0 || (scale === 1 && !Number.isInteger(delta)))
        throw new Error(`Invalid delta for ${name}: ${delta}`);
      return [key, delta];
    })
  );
}

export function validateBudgets(budgets = {}) {
  for (const [key, value] of Object.entries(budgets)) {
    if (!['layoutCount', 'styleRecalcCount'].includes(key) || !Number.isInteger(value) || value < 0) {
      throw new Error(`Invalid count budget ${key}: ${value}`);
    }
  }
}

export function exceededBudgets(metrics, budgets) {
  return Object.entries(budgets)
    .filter(([key, value]) => metrics[key] > value)
    .map(([key, value]) => `${key}: measured ${metrics[key]}, budget ${value}`);
}

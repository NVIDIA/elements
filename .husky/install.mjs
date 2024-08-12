// Skip Husky install in production and CI

console.log(`Husky env process.env.NODE_ENV ${process.env.NODE_ENV}, process.env.CI: ${process.env.CI}`);
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  console.log('Skipped Husky Install');
  process.exit(0);
}

const husky = await import('husky');
console.log(husky.install());

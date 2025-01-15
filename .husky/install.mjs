import husky from 'husky';

// Skip Husky install in production and CI
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  console.log('Skipped Husky Install');
  process.exit(0);
} else {
  husky();
}

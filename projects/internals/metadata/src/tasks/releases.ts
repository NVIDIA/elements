import { writeFileSync } from 'node:fs';
import { getReleases } from './releases.utils.ts';

const releases = await getReleases();

writeFileSync(
  './static/releases.json',
  JSON.stringify(
    {
      created: new Date().toISOString(),
      data: releases
    },
    null,
    2
  )
);

console.log('✅ Releases generated successfully.');

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const scores = {
  created: new Date().toISOString(),
  '@nvidia-elements/core': await getLighthouseScores('../../../elements'),
  '@nvidia-elements/core-react': await getLighthouseScores('../../../elements-react'),
  '@nvidia-elements/testing': await getLighthouseScores('../../../testing'),
  '@nvidia-elements/code': await getLighthouseScores('../../../labs/code'),
  '@nvidia-elements/behaviors-alpine': await getLighthouseScores('../../../labs/behaviors-alpine')
};

function getLighthouseScores(basePath) {
  const lighthouseReportPath = new URL(basePath + '/.lighthouse/dist/report.json', import.meta.url);
  return existsSync(lighthouseReportPath) ? JSON.parse(readFileSync(lighthouseReportPath)) : null;
}

writeFileSync('./static/lighthouse.json', JSON.stringify(scores, null, 2));

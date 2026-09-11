import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateNotes } from '@semantic-release/release-notes-generator';

describe('semantic-release conventionalcommits notes', () => {
  it('renders feat sections with the writer@8-compatible preset', async () => {
    const notes = await generateNotes(
      { preset: 'conventionalcommits' },
      {
        cwd: process.cwd(),
        logger: { log() {}, error() {} },
        commits: [
          {
            hash: '652e7517aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            message: 'feat(lint): support markdown linting'
          }
        ],
        lastRelease: { gitTag: 'v2.5.2', version: '2.5.2', gitHead: 'aaa' },
        nextRelease: { gitTag: 'v2.6.0', version: '2.6.0', gitHead: 'bbb', type: 'minor' },
        options: { repositoryUrl: 'https://github.com/NVIDIA/elements.git' }
      }
    );

    assert.match(notes, /### Features/);
    assert.match(notes, /support markdown linting/);
  });
});

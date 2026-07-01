import { skills, writeAgentSkillArtifacts } from '@internals/tools/skills';
import { getPublicOutputPath } from '../utils/public-output.js';

const publishedSkills = skills.filter(skill => skill.name === 'elements');

if (publishedSkills.length !== 1) {
  throw new Error('Expected exactly one "elements" skill in the registry.');
}

export function agentSkillsPlugin(eleventyConfig) {
  eleventyConfig.on('eleventy.before', async ({ directories } = {}) => {
    await writeAgentSkillArtifacts(getPublicOutputPath(directories), publishedSkills);
  });
}

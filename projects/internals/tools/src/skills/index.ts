import { coreContext } from '../prompts/index.js';

export interface Skill {
  name: string;
  title: string;
  description: string;
  context: string;
}

export const skills: Skill[] = [
  {
    name: 'elements',
    title: 'Elements Design System (nve)',
    description:
      'Build UI with NVIDIA Elements (NVE). Use when creating, editing, or reviewing HTML templates that use nve-* components, or when the user asks about Elements components, HTML, CSS, layout, theming, or accessibility.',
    context: coreContext
  }
];

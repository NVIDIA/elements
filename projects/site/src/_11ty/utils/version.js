import { ProjectsService } from '@internals/metadata';

const projects = (await ProjectsService.getData()).data;

export const ESM_PACKAGE_VERSIONS = Object.fromEntries(projects.map(project => [project.name, project.version]));
export const ESM_ELEMENTS_VERSION = ESM_PACKAGE_VERSIONS['@nvidia-elements/core'];

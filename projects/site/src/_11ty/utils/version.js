import { PackagesService } from '@nve-internals/tools/packages';

export const ESM_PACKAGE_VERSIONS = await PackagesService.versionsList();
export const ESM_ELEMENTS_VERSION = ESM_PACKAGE_VERSIONS['@nvidia-elements/core'];

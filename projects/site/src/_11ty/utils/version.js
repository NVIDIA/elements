import { PackagesService } from '@internals/tools/packages';

export const ESM_PACKAGE_VERSIONS = await PackagesService.versions();
export const ESM_ELEMENTS_VERSION = ESM_PACKAGE_VERSIONS['@nvidia-elements/core'];

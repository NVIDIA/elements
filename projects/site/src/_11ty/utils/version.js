import { ApiService } from '@internals/tools/api';

export const ESM_PACKAGE_VERSIONS = await ApiService.version();
export const ESM_ELEMENTS_VERSION = ESM_PACKAGE_VERSIONS['@nvidia-elements/core'];

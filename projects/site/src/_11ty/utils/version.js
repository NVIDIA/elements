import { MetadataService, getLatestPublishedVersions } from '@nve-internals/metadata';

export const ESM_PACKAGE_VERSIONS = await getLatestPublishedVersions(await MetadataService.getMetadata());

export const ESM_ELEMENTS_VERSION = ESM_PACKAGE_VERSIONS['@nvidia-elements/core'];

// eslint-disable-next-line @@/no-restricted-imports
import { MetadataService } from '@internals/metadata';

export const metadata = await MetadataService.getMetadata();

export const globalAttributes = Object.entries(metadata.projects)
  .flatMap(([_, value]) => {
    return value.attributes;
  })
  .filter(attribute => attribute.name.startsWith('nve-'));

export const elements = Object.entries(metadata.projects)
  .flatMap(([_, value]) => {
    return value.elements;
  })
  .filter(element => element.name.startsWith('nve-'));

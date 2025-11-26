// eslint-disable-next-line @@/no-restricted-imports
import { ApiService } from '@nve-internals/metadata';

const apis = await ApiService.getData();

export const globalAttributes = apis.data.attributes;
export const elements = apis.data.elements;

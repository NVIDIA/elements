import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, appConfig, htmlConfig } from '@nve-internals/eslint';

htmlConfig[1].rules['html/element-newline'] = 'off'; // todo
htmlConfig[1].rules['html/require-img-alt'] = 'off'; // disabled due to not following role presentation

/** @type {import('eslint').Linter.Config[]} */
export default [...elementsRecommended, ...htmlConfig, ...browserTypescriptConfig, ...appConfig];

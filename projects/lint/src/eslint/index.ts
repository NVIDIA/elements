import type { Linter } from 'eslint';
import { elementsHtmlConfig } from './configs/html.js';
import { elementsCssConfig } from './configs/css.js';
import { elementsJsonConfig } from './configs/json.js';

export const VERSION = '0.0.0';

export const elementsRecommended: Linter.Config[] = [elementsHtmlConfig, elementsCssConfig, elementsJsonConfig];

export { elementsHtmlConfig, elementsCssConfig, elementsJsonConfig };

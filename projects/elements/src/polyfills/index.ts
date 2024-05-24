/**
 * - Vitest (happy-dom/js-dom)
 * - Safari
 *
 * Used for Custom Elements Form/A11y APIs
 * https://github.com/whatwg/html/pull/8467
 * https://bugs.webkit.org/show_bug.cgi?id=215911
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1588763
 */
import 'construct-style-sheets-polyfill';
import 'element-internals-polyfill';
import 'formdata-polyfill';
import './custom-state-set.js';

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/toggleAttribute
 * - Vitest (happy-dom/js-dom)
 * - Safari
 *
 * Used in element-internals-polyfill
 */
if (!Element.prototype.toggleAttribute) {
  Element.prototype.toggleAttribute = function (name, force) {
    if (force !== void 0) {
      force = !!force;
    }

    if (this.hasAttribute(name)) {
      if (force) {
        return true;
      }

      this.removeAttribute(name);
      return false;
    }
    if (force === false) {
      return false;
    }

    this.setAttribute(name, '');
    return true;
  };
}

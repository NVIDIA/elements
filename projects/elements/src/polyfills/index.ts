
/**
 * - Vitest (happy-dom/js-dom)
 * - Safari
 * 
 * Used for Custom Elements Form/A11y APIs
 */
import 'construct-style-sheets-polyfill';
import 'element-internals-polyfill';
import 'formdata-polyfill';

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/toggleAttribute
 * - Vitest (happy-dom/js-dom)
 * - Safari
 * 
 * Used in element-internals-polyfill
 */
if (!Element.prototype.toggleAttribute) {
  Element.prototype.toggleAttribute = function(name, force) {
    if(force !== void 0) {
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

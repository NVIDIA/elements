import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/logo/define.js';

// redirect local dev server
if (globalThis.location?.hostname === 'localhost' && globalThis.location.pathname === '/') {
  globalThis.location?.replace('/elements/');
}

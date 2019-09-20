declare var __webpack_public_path__: string;

if (process.env.BABEL_ENV !== 'node') {
  if (document.currentScript) {
    const src: string | null = document.currentScript.getAttribute('src');
    if (src) {
      __webpack_public_path__ = src.replace(/bundle.js$/i, '');
    }
  }
}

module.exports = require('./sdk').default;

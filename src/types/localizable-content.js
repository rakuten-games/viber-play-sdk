// @flow

/**
 * LocalizableContent
 * To provide localized versions of your own call to action, pass an object
 * with the default cta as the value of 'default' and another object mapping
 * locale keys to translations as the value of 'localizations'.
 * @typedef {Object} LocalizableContent
 * @property {string} default - The text to be used if no suitable text is
 * found.
 * @property {string?} ja_JP - The text to be used for ja_JP locale.
 * @property {string?} en_US - The text to be used for en_US locale.
 */
export type LocalizableContent = {
  default: string,
  ja_JP: ?string,
  en_US: ?string,
  ru_RU: ?string,
};

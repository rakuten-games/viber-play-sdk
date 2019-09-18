/**
 * LocalizableContent
 * To provide localized versions of your own call to action, pass an object
 * with the default cta as the value of 'default' and another object mapping
 * locale keys to translations as the value of 'localizations'.
 * @typedef {Object} LocalizableContent
 * @property {string} default - The text to be used if no suitable text is
 * found.
 */
export interface LocalizableContent {
  default: string,
  [locale: string]: string,
};

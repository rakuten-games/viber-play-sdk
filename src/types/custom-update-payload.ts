import { LocalizableContent } from './localizable-content';

/**
 * @typedef {Object} CustomUpdatePayload
 * @property {string} action - This should be 'CUSTOM'.
 * @property {string} template - [TODO] ID of the template this custom
 * update is using. Templates should be predefined in fbapp-config.json.
 * See the [Bundle Config documentation]https://developers.facebook.com/docs/games/instant-games/bundle-config
 * for documentation about fbapp-config.json.
 * @property {string? | LocalizableContent?} cta - [TODO] An optional
 * call-to-action button text. By default we will use a localized 'Play'
 * as the button text.
 * @property {string} image - A string containing data URL of a base64
 * encoded image.
 * @property {string | LocalizableContent} text - Text message of this update.
 * @property {Object?} data - An object to be passed to any session launched
 * from this update. It can be accessed from `ViberPlay.getEntryPointData()`.
 * Its size must be <= 1000 chars when stringified.
 * @property {('IMMEDIATE' | 'LAST' | 'IMMEDIATE_CLEAR')?} strategy -
 * [TODO] Defines how the update should be delivered.
 * 'IMMEDIATE': The update should be posted immediately.
 * 'LAST': The update should be posted when the game session ends. The most
 * recent update sent using the 'LAST' strategy will be the one sent.
 * 'IMMEDIATE_CLEAR': The update is posted immediately, and clears any other
 * pending updates (such as those sent with the 'LAST' strategy).
 *
 * If no strategy is specified, we default to 'IMMEDIATE'.
 * @property {('NO_PUSH' | 'PUSH')?} notification - Specifies notification
 * setting for the custom update. This can be 'NO_PUSH' or 'PUSH', and defaults
 * to 'NO_PUSH'. Use push notification only for updates that are high-signal
 * and immediately actionable for the recipients. Also note that push
 * notification is not always guaranteed, depending on user setting and
 * platform policies.
 */
export interface CustomUpdatePayload {
  action: string,
  cta?: string | LocalizableContent,
  image: string,
  text: string | LocalizableContent,
  data?: Object,
  strategy?: 'IMMEDIATE' | 'LAST' | 'IMMEDIATE_CLEAR',
  notification?: 'NO_PUSH' | 'PUSH',
};

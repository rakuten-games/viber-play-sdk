// @flow

import type LocalizableContent from './localizable-content'

/**
 * @typedef {Object} SharePayload
 * @property {'INVITE' | 'REQUEST' | 'CHALLENGE' | 'SHARE'} intent - [TODO]
 * Represents content to be shared by the user.
 * @property {string} image - A string containing data URL of a base64
 * encoded image.
 * @property {string | LocalizableContent} text - Text message of this share.
 * @property {Object?} data - An object to be passed to any session launched
 * from this update. It can be accessed from `ViberPlay.getEntryPointData()`.
 * Its size must be <= 1000 chars when stringified.
 * @property {'NEW_CONTEXT_ONLY' | 'INCLUDE_EXISTING_CHALLENGES' | 'NEW_PLAYERS_ONLY' | 'NEW_INVITATIONS_ONLY'} [filters] - Filters
 * @property {number} minShare - Minimum selected players to share
 * @property {string | LocalizableContent} description -
 * Optional customizable text field which can be used to describe the 
 * reward a user can get from sharing.
 */
export type SharePayload = {
  intent: 'INVITE' | 'REQUEST' | 'CHALLENGE' | 'SHARE',
  image: string,
  text: string | LocalizableContent,
  data: ?Object,
  filters?: 'NEW_CONTEXT_ONLY' | 'INCLUDE_EXISTING_CHALLENGES' | 'NEW_PLAYERS_ONLY' | 'NEW_INVITATIONS_ONLY',
  minShare?: number,
  description?: string | LocalizableContent
};

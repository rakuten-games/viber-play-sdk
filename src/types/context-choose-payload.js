// @flow

/**
 * @typedef {'NEW_CONTEXT_ONLY' | 'INCLUDE_EXISTING_CHALLENGES' | 'NEW_PLAYERS_ONLY' | 'NEW_INVITATIONS_ONLY'} ContextChooseFilter
 * Defines the filtering behavior
 * 
 * `NEW_CONTEXT_ONLY` only enlists contexts that the current player
 * is in (e.g. created by a friend), but never participated in.
 * `INCLUDE_EXISTING_CHALLENGES` enlists contexts that the current
 * player has participated before.
 * `NEW_PLAYERS_ONLY` only enlists fiends who haven't played this game
 * before.
 * `NEW_INVITATIONS_ONLY` only enlists friends who haven't been sent
 * an in-game message before. You can fine tweak this filter together with
 * `hoursSinceInvitation` parameter.
 */
export type ContextChooseFilter =
  | 'NEW_CONTEXT_ONLY'
  | 'INCLUDE_EXISTING_CHALLENGES'
  | 'NEW_PLAYERS_ONLY'
  | 'NEW_INVITATIONS_ONLY';

/**
 * @typedef {Object} ContextChoosePayload
 * @property {Array<ContextChooseFilter>} filters -
 * Provide an array of filters you'd like to apply to the friend list.
 * Please note that filter combinations are not supported at the moment of
 * writing. Only the first filter is respected, the later ones are simply just
 * ignored.
 * @property {number} maxSize - Context maximum size for matching
 * @property {number} minSize - Context minimum size for matching
 * @property {number} hoursSinceInvitation - Specify how long a friend should
 * be filtered out after the curent player sends him/her a message.
 * This parameter only applies when `NEW_INVITATIONS_ONLY` filter is used.
 * When not specified, will filter out any friend who has been sent a message.
 */
export type ContextChoosePayload = {
  filters?: [ContextChooseFilter],
  maxSize?: number,
  minSize?: number,
  hoursSinceInvitation?: number
};

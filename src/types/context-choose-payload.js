// @flow

/**
 * @typedef {Object} ContextChoosePayload
 * @property {'NEW_CONTEXT_ONLY' | 'INCLUDE_EXISTING_CHALLENGES' | 'NEW_PLAYERS_ONLY'} [filters] - Filters
 * @property {number} maxSize - Context maximum size for matching
 * @property {number} minSize - Context minimum size for matching
 */
export type ContextChoosePayload = {
  filters?: 'NEW_CONTEXT_ONLY' | 'INCLUDE_EXISTING_CHALLENGES' | 'NEW_PLAYERS_ONLY',
  maxSize?: number,
  minSize?: number,
};

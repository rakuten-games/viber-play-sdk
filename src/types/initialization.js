// @flow

/**
 * @typedef {Object} InitializationOptions
 * @property {boolean} useLegacyLeaderboard - if set to true the legacy leaderboard service will be used
 * @property {string | Element} scrollTarget? - by default, scrolling will be disabled in game frame to prevent unexpected scrolling behavior. If scrolling is needed in the game, set the root element (or its selector) here, then any child element of it can be scrolled.
 */
export type InitializationOptions = {
  useLegacyLeaderboard: boolean,
  scrollTarget?: string | Element,
};

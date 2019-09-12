// @flow

/**
 * @typedef {Object} InitializationOptions
 * @property {boolean} useLegacyLeaderboard - If set to true the legacy leaderboard service will be used.
 * @property {string | Element} scrollTarget? - By default, scrolling will be locked in game frame to prevent unexpected behavior (e.g. scroll while flicking). If scrolling is needed, set an element (or its selector) here, then the element (including its children) will be scrollable. If scrolling lock needs to be disabled, set `document.body` here.
 */
export type InitializationOptions = {
  useLegacyLeaderboard: boolean,
  scrollTarget?: string | Element,
};

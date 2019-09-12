// @flow

/**
 * @typedef {Object} ShareResult
 * @property {number} sharedNum - Number of player user has sent share events.
 * It will be returned after `ViberPlay.shareAsync()`.
 */
export type ShareResult = {
  sharedNum: number
};

// @flow

/**
 * @typedef {Object} ContextSizeResponse
 * @property {boolean} answer - Result
 * @property {number} minSize - The minimum bound of the context size query
 * @property {number} maxSize - The maximum bound of the context size query.
 */

export type ContextSizeResponse = {
  answer: boolean,
  minSize: ?number,
  maxSize: ?number,
};

// @flow

import Player from './player';
import type { PlayerPayload } from './player';

export type ContextPlayerPayload = PlayerPayload;

/**
 * Representing a context player.
 * @protected
 * @extends Player
 */
export default class ContextPlayer extends Player { }

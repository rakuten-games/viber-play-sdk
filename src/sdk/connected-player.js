// @flow

import Player from './player';
import type { PlayerPayload } from './player';

export type ConnectedPlayerPayload = PlayerPayload;

/**
 * Representing a connected player.
 * @protected
 * @extends Player
 */
export default class ConnectedPlayer extends Player {}

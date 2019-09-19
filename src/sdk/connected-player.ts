import Player from './player';
import { PlayerPayload } from '../types/player';

export type ConnectedPlayerPayload = PlayerPayload;

/**
 * Representing a connected player.
 * @protected
 * @extends Player
 */
export default class ConnectedPlayer extends Player {}

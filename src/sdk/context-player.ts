import Player from './player';
import { PlayerPayload } from '../types/player';

export type ContextPlayerPayload = PlayerPayload;

/**
 * Representing a context player.
 * @protected
 * @extends Player
 */
export default class ContextPlayer extends Player { }

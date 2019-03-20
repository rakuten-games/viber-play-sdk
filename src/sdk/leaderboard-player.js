// @flow

import Player from './player';
import type { PlayerPayload } from './player';

export type LeaderboardPlayerPayload = PlayerPayload;

/**
 * Representing a leaderboard player.
 * @extends Player
 */
export default class LeaderboardPlayer extends Player { }

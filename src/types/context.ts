import { LocalizableContent } from './localizable-content'
import ContextPlayer from '../models/context-player';

/**
 * Defines the filtering behavior
 *
 * `NEW_CONTEXT_ONLY` only enlists contexts that the current player is in, but never participated in (e.g. a new context created by a friend).
 * `INCLUDE_EXISTING_CHALLENGES` enlists contexts that the current player has participated before.
 * `NEW_PLAYERS_ONLY` only enlists fiends who haven't played this game before.
 * `NEW_INVITATIONS_ONLY` only enlists friends who haven't been sent an in-game message before. This filter can be fine-tuned with `hoursSinceInvitation` parameter.
 */
export type ContextFilter = 'NEW_CONTEXT_ONLY'
  | 'INCLUDE_EXISTING_CHALLENGES'
  | 'NEW_PLAYERS_ONLY'
  | 'NEW_INVITATIONS_ONLY';

export interface ContextChoosePayload {
  /** 
   * An array of filters to be applied to the friend list.
   * (Please note that filter combinations are not supported. Only the first filter is respected, the later ones are simply just ignored.)
   */
  filters?: [ContextFilter];
  /** Context maximum size for matching */
  maxSize?: number;
  /** Context minimum size for matching */
  minSize?: number;
  /**
   * Specify how long a friend should be filtered out after the curent player sends him/her a message.
   * This parameter only applies when `NEW_INVITATIONS_ONLY` filter is used.
   * When not specified, it will filter out any friend who has been sent a message.
   */
  hoursSinceInvitation?: number;
  /** 
   * Optional customizable text field in the share UI.
   * This can be used to describe the incentive a user can get from sharing.
   */
  description?: string | LocalizableContent,
}

export interface ContextSizeResponse {
  /** Result about whether the context fits the requested size */
  answer: boolean;
  /** The minimum bound of the context size query */
  minSize?: number;
  /** The maximum bound of the context size query */
  maxSize?: number;
}

/** @hidden */
export interface CurrentContext {
  id: string | null;
  type: 'SOLO' | 'THREAD';
  size: number;
  connectedPlayers: ContextPlayer[];
}

import conn from '../utils/conn';
import state from '../utils/state';

import ContextPlayer from '../models/context-player';
import { ContextChoosePayload, ContextSizeResponse } from '../types/context';
import {
  ContextCreateContextResponse,
  ContextSwitchContextResponse,
  ContextChooseContextResponse,
  ContextGetContextPlayersResponse
} from '../types/bridge';


/**
 * Get id of context
 */
export function getID (): string | null {
  return state.context.id;
}

/**
 * Get type of context
 */
export function getType (): 'SOLO' | 'THREAD' {
  return state.context.type;
}

/**
 * Check if the count of players in context is between given numbers
 */
export function isSizeBetween (
  minSize?: number,
  maxSize?: number
): ContextSizeResponse | null {
  const { size } = state.context;

  if (size === null) {
    return null;
  }

  if (minSize === null && maxSize === null) {
    return null;
  }

  if (
    (minSize && !Number.isInteger(minSize)) ||
    (maxSize && !Number.isInteger(maxSize))
  ) {
    return null;
  }

  const minVal = minSize || 0;
  const maxVal = maxSize || Infinity;

  return {
    answer: minVal <= size && size <= maxVal,
    minSize,
    maxSize
  };
}

/**
 * Create context with player
 * @param playerId - Player ID of the player
 */
export function createAsync (playerId: string): Promise<void> {
  return Promise.resolve()
    .then(() => {
      if (!playerId) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'playerId is not set'
        };

        throw err;
      }

      if (playerId === state.player.id) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'can not use ID of the current player'
        };

        throw err;
      }

      return conn.request<ContextCreateContextResponse>(
        'sgContextCreateContext',
        { playerId }
      );
    })
    .then(({ id, type, size }) => {
      state.context.id = id;
      state.context.type = type;
      state.context.size = size;
    })
}

/**
 * Switch context by context id
 * @param contextId - Context ID of the context
 */
export function switchAsync (contextId: string): Promise<void> {
  return Promise.resolve().then(() => {
    if (!contextId) {
      const err = {
        code: 'INVALID_PARAM',
        message: 'The contextId is not set'
      };
      throw err;
    }

    if (state.context.id === contextId) {
      const err = {
        code: 'SAME_CONTEXT',
        message: 'Must specify a context other than the current one'
      };
      throw err;
    }

    return conn
      .request<ContextSwitchContextResponse>('sgContextSwitchContext', {
        contextId
      })
      .then(({ id, type, size }) => {
        state.context.id = id;
        state.context.type = type;
        state.context.size = size;
        state.context.connectedPlayers = [];
      });
  })
}

/**
 * Popup a friend dialog to establish context
 * @param payload An object describes the choose context
 */
export function chooseAsync (payload: ContextChoosePayload): Promise<void> { 
  return Promise.resolve().then(() => {
    if (payload) {
      if (payload.filters) {
        for (let i = 0; i < payload.filters.length; i += 1) {
          if (
            ![
              'NEW_CONTEXT_ONLY',
              'INCLUDE_EXISTING_CHALLENGES',
              'NEW_PLAYERS_ONLY',
              'NEW_INVITATIONS_ONLY'
            ].includes(payload.filters[i])
          ) {
            const err = {
              code: 'INVALID_PARAM',
              message: 'Invalid filter'
            };
            throw err;
          }
        }
      }

      if (
        payload.hoursSinceInvitation &&
        !Number.isInteger(payload.hoursSinceInvitation)
      ) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'The hoursSinceInvitation is not integer'
        };
        throw err;
      }

      if (payload.minSize && !Number.isInteger(payload.minSize)) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'The minSize is not integer'
        };
        throw err;
      }

      if (payload.maxSize && !Number.isInteger(payload.maxSize)) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'The maxSize or maxSize is invalid'
        };
        throw err;
      }

      if (payload.minSize && payload.minSize < 2) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'The minSize must be at least 2'
        };
        throw err;
      }

      if (payload.maxSize && payload.maxSize < 2) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'The maxSize must be at least 2'
        };
        throw err;
      }

      if (
        payload.maxSize &&
        payload.minSize &&
        payload.minSize > payload.maxSize
      ) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'The minSize cannot be greater than maxSize'
        };
        throw err;
      }
    }

    return conn
      .request<ContextChooseContextResponse>('sgContextChooseContext', {
        ...payload
      })
      .then(({ id, type, size }) => {
        state.context.id = id;
        state.context.type = type;
        state.context.size = size;
        state.context.connectedPlayers = [];
      });
  })
}

/**
 * Get an array of ContextPlayer containing players in the same context
 */
export function getPlayersAsync (): Promise<ContextPlayer[]> {
  return Promise.resolve()
    .then(() => {
      if (!state.context.id) {
        const err = {
          code: 'INVALID_OPERATION',
          message: 'Can not get context players in a solo context'
        };
        throw err;
      }

      return conn.request<ContextGetContextPlayersResponse>(
        'sgContextGetContextPlayers',
        {
          contextId: state.context.id
        }
      );
    })
    .then(res => {
      const players = res.data.map(
        playerPayload => new ContextPlayer(playerPayload)
      );

      state.context.connectedPlayers = players;
      return state.context.connectedPlayers;
    })
}

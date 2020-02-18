import conn from './utils/conn';
import state from './utils/state';

import {
  ReadyResponse,
} from './types/bridge';

import * as _ViberPlay from './sdk';

/**
 * `ViberPlay` stands for the namespace containing all APIs of the Viber Play SDK.
 */
const ViberPlay = _ViberPlay

conn
  .request<ReadyResponse>('sgReady')
  .then(({ gameId }) => {
    state.gameId = gameId;
  })
  .catch(() => {});

export default ViberPlay;

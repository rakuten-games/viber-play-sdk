import conn from './utils/conn';
import state from './utils/state';

import {
  ReadyResponse,
} from './types/bridge';

import * as _ViberPlay from './sdk';

const ViberPlay = _ViberPlay

conn
  .request<ReadyResponse>('sgReady')
  .then(({ gameId }) => {
    state.gameId = gameId;
  })
  .catch(() => {});

export default ViberPlay;

import { CurrentPlayer, PlayerData } from '../types/player';
import { CurrentContext } from '../types/context';
import { EntryPointData } from '../types/entry-point-data';
import { TrafficSource } from '../types/traffic-source';
import { Platform } from '../types/platform';

/** @hidden */
interface State {
  gameId: string;
  player: CurrentPlayer;
  context: CurrentContext;
  entryPointData: EntryPointData;
  trafficSource: TrafficSource;
  playerData: PlayerData;
  platform: Platform;
}

/**
 * Local state, this may be out of date, but provides synchronous cache for
 * best guesses and storage for options.
 * @hidden
 */
const state: State = {
  gameId: '',
  player: {
    name: null,
    id: null,
    photo: null,
    connectedPlayers: []
  },
  context: {
    id: null,
    type: 'SOLO',
    size: 1,
    connectedPlayers: []
  },
  entryPointData: {},
  trafficSource: {},
  playerData: {},
  platform: 'WEB',
};

export default state;

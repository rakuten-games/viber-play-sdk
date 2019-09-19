import { CurrentPlayer, PlayerData } from './player';
import { CurrentContext } from './context';
import { EntryPointData } from './entry-point-data';
import { TrafficSource } from './traffic-source';

export interface State {
  gameId: string;
  player: CurrentPlayer;
  context: CurrentContext;
  entryPointData: EntryPointData;
  trafficSource: TrafficSource;
  playerData: PlayerData;
}

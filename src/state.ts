import { State } from './types/state';

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
  playerData: {}
};

export default state;

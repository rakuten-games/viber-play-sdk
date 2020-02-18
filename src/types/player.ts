import ConnectedPlayer from "../models/connected-player";

export interface PlayerData {
  [key: string]: any;
}

/** @hidden */
export interface PlayerRawData {
  id: string,
  name: string,
  photo: string,
  hasPlayed: boolean,
}

/** @hidden */
export interface CurrentPlayer {
  name: string | null;
  id: string | null;
  photo: string | null;
  connectedPlayers: ConnectedPlayer[];
}

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
export interface IPlayer {
  getID(): string;
  getName(): string;
  getPhoto(): string;
}

/** @hidden */
export interface CurrentPlayer {
  name: string | null;
  id: string | null;
  photo: string | null;
  connectedPlayers: ConnectedPlayer[];
}

export type SignedPlayerInfo = string;

/** @hidden */
export interface ISignedPlayerInfo {
  getPlayerID(): string;
  getSignature(): SignedPlayerInfo;
}

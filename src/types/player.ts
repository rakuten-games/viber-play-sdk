import ConnectedPlayer from "../sdk/connected-player";

export interface PlayerPayload {
  id: string,
  name: string,
  photo: string,
  hasPlayed: boolean,
};

export interface PlayerData {
  [key: string]: any;
}

export interface PlayerRawData {
  id: string,
  name: string,
  photo: string,
  hasPlayed: boolean,
}

export interface IPlayer {
  getID(): string;
  getName(): string;
  getPhoto(): string;
}

export interface CurrentPlayer {
  name: string | null;
  id: string | null;
  photo: string | null;
  connectedPlayers: ConnectedPlayer[];
}

export type SignedPlayerInfo = string;

export interface ISignedPlayerInfo {
  getPlayerID(): string;
  getSignature(): SignedPlayerInfo;
}

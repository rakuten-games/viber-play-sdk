import {
  CurrentPlayer,
  PlayerPayload,
  PlayerData,
  SignedPlayerInfo
} from './player';
import { CurrentContext } from './context';
import { EntryPointData } from './entry-point-data';
import { TrafficSource } from './traffic-source';
import { Product, Purchase } from './iap';
import { LeaderboardEntryPayload } from './leaderboard';
import { AdInstancePayload } from './ad-instance';

/** @hidden */
export interface ReadyResponse {
  gameId: string;
}

/** @hidden */
export type SetLoadingProgressResponse = void;

/** @hidden */
export type StartGameResponse = void;

/** @hidden */
export interface InitializeResponse {
  player: CurrentPlayer;
  context: CurrentContext;
  entryPointData: EntryPointData;
  trafficSource: TrafficSource;
}

/** @hidden */
export type SwitchGameResponse = void;

/** @hidden */
export type QuitResponse = void;

// ads
/** @hidden */
export type GetInterstitialAdResponse = AdInstancePayload;

// leaderboard
/** @hidden */
export interface GetLeaderboardResponse {
  id: number;
  name: string;
  contextId: string | null;
}

/** @hidden */
export type LeaderboardGetEntryCountResponse = number;

/** @hidden */
export type LeaderboardSetScoreResponse = LeaderboardEntryPayload;

/** @hidden */
export type LeaderboardGetPlayerEntryResponse = LeaderboardEntryPayload | null;

/** @hidden */
export type LeaderboardGetEntriesResponse = LeaderboardEntryPayload[];

/** @hidden */
export type LeaderboardGetConnectPlayerEntriesResponse = LeaderboardEntryPayload[];

// message
/** @hidden */
export interface ShareResponse {
  sharedCount: number;
}

/** @hidden */
export type UpdateResponse = void;

// player
/** @hidden */
export type PlayerFlushDataResponse = void;

/** @hidden */
export interface PlayerGetConnectedPlayersResponse {
  data: PlayerPayload[];
}

/** @hidden */
export interface PlayerGetDataResponse {
  data: PlayerData;
}

/** @hidden */
export interface PlayerSetDataResponse {
  data: PlayerData;
}

/** @hidden */
export interface PlayerGetSignedInfoV4Response {
  signature: SignedPlayerInfo;
}

// context
/** @hidden */
export interface ContextCreateContextResponse {
  id: string;
  type: 'THREAD';
  size: number;
}
/** @hidden */
export type ContextSwitchContextResponse = ContextCreateContextResponse;

/** @hidden */
export type ContextChooseContextResponse = ContextCreateContextResponse;

/** @hidden */
export interface ContextGetContextPlayersResponse {
  data: PlayerPayload[];
}

// bot
/** @hidden */
export type SetSessionDataResponse = void;

/** @hidden */
export type CanSubscribeBotResponse = boolean;

/** @hidden */
export type SubscribeBotResponse = void;

/** @hidden */
export type SubscribePlatformBotResponse = void;

// payments
/** @hidden */
export type PaymentsGetCatalogResponse = Product[];

/** @hidden */
export type PaymentsPurchaseResponse = Purchase;

/** @hidden */
export type PaymentsGetPurchasesResponse = Purchase[];

/** @hidden */
export type PaymentsConsumePurchaseResponse = void;

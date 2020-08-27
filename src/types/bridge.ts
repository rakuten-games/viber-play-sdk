import {
  InitializeResponsePlayer,
  PlayerRawData,
  PlayerData
} from './player';
import { InitializeResponseContext } from './context';
import { EntryPointData } from './entry-point-data';
import { TrafficSource } from './traffic-source';
import { Product, Purchase } from './iap';
import { LeaderboardEntryRawData } from './leaderboard';
import { AdInstanceRawData } from './ad-instance';
import { Signature } from './signature';
import { Platform } from './platform';

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
  player: InitializeResponsePlayer;
  context: InitializeResponseContext;
  entryPointData: EntryPointData;
  trafficSource: TrafficSource;
  platform: Platform;
}

/** @hidden */
export type SwitchGameResponse = void;

/** @hidden */
export type QuitResponse = void;

// ads
/** @hidden */
export type GetInterstitialAdResponse = AdInstanceRawData;

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
export type LeaderboardSetScoreResponse = LeaderboardEntryRawData;

/** @hidden */
export type LeaderboardGetPlayerEntryResponse = LeaderboardEntryRawData | null;

/** @hidden */
export type LeaderboardGetEntriesResponse = LeaderboardEntryRawData[];

/** @hidden */
export type LeaderboardGetConnectPlayerEntriesResponse = LeaderboardEntryRawData[];

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
  data: PlayerRawData[];
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
  signature: Signature;
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
  data: PlayerRawData[];
}

// bot
/** @hidden */
export type SetSessionDataResponse = void;

/** @hidden */
export type CanSubscribeBotResponse = boolean;

/** @hidden */
export type SubscribeBotResponse = void;

// payments
/** @hidden */
export type PaymentsGetCatalogResponse = Product[];

/** @hidden */
export type PaymentsPurchaseResponse = Purchase;

/** @hidden */
export type PaymentsGetPurchasesResponse = Purchase[];

/** @hidden */
export type PaymentsConsumePurchaseResponse = void;

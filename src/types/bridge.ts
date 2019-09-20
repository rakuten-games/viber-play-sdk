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

export interface ReadyResponse {
  gameId: string;
}

export type SetLoadingProgressResponse = void;

export type StartGameResponse = void;

export interface InitializeResponse {
  player: CurrentPlayer;
  context: CurrentContext;
  entryPointData: EntryPointData;
  trafficSource: TrafficSource;
}

export type SwitchGameResponse = void;

export type QuitResponse = void;

// ads
export type GetInterstitialAdResponse = AdInstancePayload;

// leaderboard
export interface GetLeaderboardResponse {
  id: number;
  name: string;
  contextId: string | null;
}

export type LeaderboardGetEntryCountResponse = number;

export type LeaderboardSetScoreResponse = LeaderboardEntryPayload;

export type LeaderboardGetPlayerEntryResponse = LeaderboardEntryPayload | null;

export type LeaderboardGetEntriesResponse = LeaderboardEntryPayload[];

export type LeaderboardGetConnectPlayerEntriesResponse = LeaderboardEntryPayload[];

// message
export interface ShareResponse {
  sharedCount: number;
}

export type UpdateResponse = void;

// player
export type PlayerFlushDataResponse = void;

export interface PlayerGetConnectedPlayersResponse {
  data: PlayerPayload[];
}

export interface PlayerGetDataResponse {
  data: PlayerData;
}

export interface PlayerSetDataResponse {
  data: PlayerData;
}

export interface PlayerGetSignedInfoV4Response {
  signature: SignedPlayerInfo;
}

// context
export interface ContextCreateContextResponse {
  id: string;
  type: 'THREAD';
  size: number;
}
export type ContextSwitchContextResponse = ContextCreateContextResponse;

export type ContextChooseContextResponse = ContextCreateContextResponse;

export interface ContextGetContextPlayersResponse {
  data: PlayerPayload[];
}

// bot
export type SetSessionDataResponse = void;

export type CanSubscribeBotResponse = boolean;

export type SubscribeBotResponse = void;

export type SubscribePlatformBotResponse = void;

// payments
export type PaymentsGetCatalogResponse = Product[];

export type PaymentsPurchaseResponse = Purchase;

export type PaymentsGetPurchasesResponse = Purchase[];

export type PaymentsConsumePurchaseResponse = void;

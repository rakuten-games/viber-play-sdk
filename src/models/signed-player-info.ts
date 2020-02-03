import { Signature } from "../types/signature";

/**
 * Represents player info in a secure way, encrypted by the server side of
 * the platform hosting the game.
 * Game server can decrypt this info on to verify if this is data is really
 * sent from the platform.
 */
export default class SignedPlayerInfo {
  private id: string;
  private signature: string;

  /**
   * @hideconstructor
   */
  constructor(id: string, signature: string) {
    this.id = id;
    this.signature = signature;
  }

  /**
   * Get the player's ID
   * @returns Player ID
   * @example
   * ViberPlay.player.getSignedPlayerInfoAsync('some_metadata')
    *  .then(function (result) {
    *    result.getPlayerID(), // same value as ViberPlay.player.getID()
    *  });
   */
  getPlayerID(): string {
    return this.id;
  }

  /**
   * Get the signature string
   * @returns Signature of player info
   * @example
   * ViberPlay.player.getSignedPlayerInfoAsync('some_metadata')
    *  .then(function (result) {
    *    result.getSignature(); // some string like this, 'S0M3_5igNatvR3.eyJpc3N1ZWRfYXQiOiAxNTM5OTMxNDQ2LCAicGxheWVyX2lkIjogIjgwZDU4N2UyODkzNjdlNTVhZjRhNGQ0OTIyOThkNmRkNDdjMGFiYmMyMjc1YjNjMDQ0ODkyMTY2ZGE3MzM5NmYiLCAiYWxnb3JpdGhtIjogIkhNQUMtU0hBMjU2IiwgInJlcXVlc3RfcGF5bG9hZCI6ICJteV9tZXRhZGF0YSJ9'
    *  });
   */
  getSignature(): Signature {
    return this.signature;
  }
}

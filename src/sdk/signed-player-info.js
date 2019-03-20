// @flow

/**
 * Represents player info in a secure way, encrypted by the server side of
 * the platform hosting the game.
 * Game server can decrypt this info on to verify if this is data is really
 * sent from the platform.
 */
export default class SignedPlayerInfo {
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
   *
   * On the game server, please validate this signature by the following steps:
   *
   * 1. Split the signature into two parts delimited by the `.` character.
   * 2. Decode the first part with base64url encoding.
   * 3. Decode the second part with base64url encoding, which should be a
   *    string representation of an JSON object with fields below:
   *
   *    - algorithm - always `HMAC-SHA256`
   *    - issued_at - a unix timestamp representing the time signature
   *      is issued.
   *    - player_id - Auth ID of the player.
   *    - request_payload - the requestPayload string you defined when
   *      calling `ViberPlay.player.getSignedPlayerInfoAsync`.
   *
   * 4. Hash the second part string using HMAC SHA-256 and your app
   *    secret, check if it is identical to the first part string.
   * 5. You may also wish to validate the timestamp to see if the request was
   *    made recently.
   * @returns Signature
   * @example
   * ViberPlay.player.getSignedPlayerInfoAsync('some_metadata')
    *  .then(function (result) {
    *    result.getSignature(); // some string like this, 'S0M3_5igNatvR3.eyJpc3N1ZWRfYXQiOiAxNTM5OTMxNDQ2LCAicGxheWVyX2lkIjogIjgwZDU4N2UyODkzNjdlNTVhZjRhNGQ0OTIyOThkNmRkNDdjMGFiYmMyMjc1YjNjMDQ0ODkyMTY2ZGE3MzM5NmYiLCAiYWxnb3JpdGhtIjogIkhNQUMtU0hBMjU2IiwgInJlcXVlc3RfcGF5bG9hZCI6ICJteV9tZXRhZGF0YSJ9'
    *  });
   */
  getSignature(): string {
    return this.signature;
  }
}

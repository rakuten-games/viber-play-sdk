/**
 * A signature that can be verified on game's backend server.
 * Server side validation can be done by following these steps:
 *
 * 1. Split the signature into two parts delimited by the `.` character.
 * 2. Decode the first part with base64url encoding, which should be a hash.
 * 3. Decode the second part with base64url encoding, which should be a string representation of an JSON object.
 * 4. Hash the second part string using HMAC SHA-256 and your app secret, check if it is identical to the hash from step 2.
 * 5. Optionally, developer can also validate the timestamp to see if the request is made recently.
 */
export type Signature = string;

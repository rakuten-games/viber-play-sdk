// @flow

/**
 * @typedef {Object} Product
 * @property {string} title - Title of the product
 * @property {string} productID - ID of the product
 * @property {string?} description - Text description of the product
 * @property {string?} imageURI - A URL to the product's image
 * @property {string} price - A localized string representing the product's pirce in the local currency, e.g. "$1"
 * @property {string} priceCurrencyCode - A string representing which currency is the price calculated in, following [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217)
 */
export type Product = {
  title: string,
  productID: string,
  description: ?string,
  imageURI: ?string,
  price: string,
  priceCurrencyCode: string
};

/**
 * @typedef {Object} PurchaseConfig
 * @property {string} productID - ID of the product
 * @property {string?} developerPayload - An optional payload can be assigned by game developer, which will be attached in the signed purchase request
 */
export type PurchaseConfig = {
  productID: string,
  developerPayload: ?string
};

/**
 * @typedef {Object} Purchase
 * @property {string} productID - ID of the product
 * @property {string?} developerPayload - An optional payload can be assigned by game developer, which will be attached in the signed purchase request
 */
export type Purchase = {
  developerPayload: ?string,
  paymentID: string,
  productID: string,
  purchaseTime: string,
  purchaseToken: string,
  signedRequest: SignedPurchaseRequest
};

/**
 * @typedef {string} SignedPurchaseRequest
 */
export type SignedPurchaseRequest = string;

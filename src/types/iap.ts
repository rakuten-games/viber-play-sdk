import { Signature } from './signature'

export interface Product {
  /** Title of the product */
  title: string,
  /** ID of the product */
  productID: string,
  /** Text description of the product */
  description?: string,
  /** A URL to the product's image */
  imageURI?: string,
  /** A localized string representing the product's pirce in the local currency, e.g. "$1" */
  price: string,
  /** A string representing which currency is the price calculated in, following [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) */
  priceCurrencyCode: string
};

export interface PurchaseConfig {
  /** ID of the product */
  productID: string,
  /** Optional payload assigned by game developer, which will be also attached in the signed purchase request */
  developerPayload?: string
};

export interface Purchase {
  /** Optional payload assigned by game developer, which will be also attached in the signed purchase request */
  developerPayload?: string,
  /** ID of the payment (e.g. Google Play Order) */
  paymentID: string,
  /** ID of the product */
  productID: string,
  /** Timestamp of the payment */
  purchaseTime: string,
  /** Token for purchase consumption */
  purchaseToken: string,
  /** Signature of the purchase info for server side verification */
  signedRequest: Signature
};

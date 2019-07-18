// @flow

/**
 * @typedef {Object} Producct
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

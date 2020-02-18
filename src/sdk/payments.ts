import conn from '../utils/conn';

import { Product, Purchase, PurchaseConfig } from '../types/iap';
import {
  PaymentsGetCatalogResponse,
  PaymentsPurchaseResponse,
  PaymentsGetPurchasesResponse,
  PaymentsConsumePurchaseResponse
} from '../types/bridge';

/**
 * Set a callback when payment features are ready.
 * On unsupported device, the callback will never be invoked.
 * @category Experimental
 * @example
 * ```
 * ViberPlay.payments.onReady(function () {
 *   console.log('Ready to receive payments requests')
 * })
 * ```
 */
export function onReady (callback: () => any): void {
  conn.request('sgPaymentsOnReady').then(() => callback());
}

/**
 * Get the catalog for info on available products. 
 * There's chance in getting an empty list even though the device supports In-App Purchase.
 * (e.g. Google Play doesn't support purchase in the user's region.)
 * @category Experimental
 * @returns Array of products with pricing information
 * @example
 * ```
 * ViberPlay.payments.getCatalogAsync().then((catalog) => {
 *   console.log(catalog)
 * })
 * ```
 */
export function getCatalogAsync (): Promise<Product[]> {
  return conn.request<PaymentsGetCatalogResponse>('sgPaymentsGetCatalog')
}

/**
 * Request an purchase on the specified product.
 * This will invoke the native In-App Purchase screen and return the result.
 * @category Experimental
 * @param config - An object containing purchase configuration information
 * @returns Purchase information
 * @example
 * ```
 * ViberPlay.payments.purchaseAsync({
 *   productID: 'someProduct',
 *   developerPayload: 'somePayload'
 * }).then((purchase) => {
 *   console.log(purchase)
 * })
 * ```
 */
export function purchaseAsync (config: PurchaseConfig): Promise<Purchase> {
  if (typeof config !== 'object') {
    const err = {
      code: 'INVALID_PARAM',
      message: 'PurchaseConfig is expected to be an object.'
    };

    throw err;
  }

  if (typeof config.productID !== 'string') {
    const err = {
      code: 'INVALID_PARAM',
      message: 'ProductID is expected to be a string.'
    };

    throw err;
  }

  return conn.request<PaymentsPurchaseResponse>('sgPaymentsPurchaseV2', {
    productId: config.productID,
    developerPayload: config.developerPayload
  });
}

/**
 * Get unconsumed purchases.
 * Developers should validate the purchase signatures on server side before provisioning corresponding game item.
 * @category Experimental
 * @returns purchases
 * @example
 * ```
 * ViberPlay.payments.getPurchasesAsync().then((purchases) => {
 *   console.log(purchases)
 * })
 * ```
 */
export function getPurchasesAsync (): Promise<Purchase[]> {
  return conn.request<PaymentsGetPurchasesResponse>(
    'sgPaymentsGetPurchasesV2'
  );
}

/**
 * Consume a purchase.
 * This will update the status of the corrsponding purchase, and allow the player to purchase the same product for another time.
 * @category Experimental
 * @param purchaseToken - A string of purchase token used for consumption
 * @returns
 * @example
 * ```
 * ViberPlay.payments.consumePurchaseAsync('somePurchaseToken').then(() => {
 *   console.log('Purchase is consumed')
 * })
 * ```
 */
export function consumePurchaseAsync (purchaseToken: string): Promise<void> {
  if (typeof purchaseToken !== 'string') {
    const err = {
      code: 'INVALID_PARAM',
      message: 'Purchase token is expected to be a string.'
    };

    throw err;
  }

  return conn.request<PaymentsConsumePurchaseResponse>(
    'sgPaymentsConsumePurchase',
    {
      purchaseToken
    }
  );
}

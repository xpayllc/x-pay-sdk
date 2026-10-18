# X Pay JavaScript SDK

A server-side JavaScript client for creating and retrieving payments through the X Pay merchant API.

[Website](https://x-pay.llc/) · [Dashboard](https://www.app-xpay.com/dashboard) · [Integration guide](https://github.com/xpayllc/xpayllc/blob/main/DEVELOPERS.md) · [Published npm package](https://www.npmjs.com/package/@xpay-llc/sdk)

## Install

The version in this repository is **1.0.1**. It updates the API address and accepts current dashboard test/live merchant keys. It is not yet published to npm. To use this version:

```sh
npm install github:xpayllc/x-pay-sdk#main
```

For reproducible production deployments, pin a reviewed commit rather than the moving `main` branch.

`npm install @xpay-llc/sdk` currently installs **1.0.0**. That older release only accepts `xpay_sk_` keys and defaults to the older `api.xpay.llc` host. Use the repository version for current `xp_test_` and `xp_live_` merchant keys until the npm release is updated.

## Create a payment

Use Node.js 18 or later. Keep your merchant secret key on your server.

```js
import { XPay } from '@xpay-llc/sdk';

const xpay = new XPay({
  apiKey: process.env.XPAY_API_KEY,
  baseUrl: 'https://www.app-xpay.com',
});

const payment = await xpay.payments.create({
  amount: 10,
  currency: 'USD',
  description: 'Order payment',
});
console.log(payment.id);
```

Start with a test-mode merchant key. A live key can create real payment requests. Check the dashboard's API reference for supported payment methods, amount rules and response fields. Never infer payment completion from request creation alone; confirm payment state before fulfilling an order.

The `secretKey` option remains supported as an alias for `apiKey`. An optional `baseUrl` overrides the default `https://www.app-xpay.com`.

## Retrieve a payment

```js
const payment = await xpay.payments.retrieve(paymentId);
console.log(payment.status);
```

## Handle errors

```js
import { XPayError } from '@xpay-llc/sdk';

try {
  const payment = await xpay.payments.retrieve(paymentId);
} catch (error) {
  if (error instanceof XPayError) {
    console.error(error.statusCode, error.type, error.message);
  } else {
    throw error;
  }
}
```

The client does not automatically retry requests. After a timeout, reconcile the payment state before creating another request. Never log your key or reusable signed payment payloads.

## Facilitator integration is separate

This merchant SDK does **not** sign x402 authorizations or wrap the facilitator `/verify` and `/settle` endpoints. A merchant payment key is not interchangeable with a dedicated facilitator key, even when both start with `xp_live_`.

For Base and BNB USDC facilitator integration, use the [facilitator guide](https://github.com/xpayllc/xpayllc/blob/main/DEVELOPERS.md) and an x402-compatible client. Generate the dedicated key in [Dashboard → Facilitator Access](https://www.app-xpay.com/dashboard/facilitator).

## Development

```sh
npm test
```

The tests use mocked responses and make no payments. They cover authentication headers, test/live key compatibility, request paths, payment payloads and API errors. They do not establish live end-to-end payment processing.

Report issues at https://github.com/xpayllc/x-pay-sdk/issues. Include redacted errors only. Do not post credentials.

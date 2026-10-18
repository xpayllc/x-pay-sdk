import test from 'node:test';
import assert from 'node:assert/strict';
import { XPay, XPayError } from './index.js';

test('current merchant keys use the dashboard API and authorization header', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({url, options});
    return new Response(JSON.stringify({id:'pay_test', status:'pending'}));
  };
  try {
    for (const key of ['xp_test_fixture','xp_live_fixture','xpay_sk_fixture']) {
      const client = new XPay({apiKey:key});
      await client.payments.create({amount:10,currency:'USD'});
      const call=calls.at(-1);
      assert.equal(call.url,'https://www.app-xpay.com/v1/payments');
      assert.equal(call.options.headers.Authorization,`Bearer ${key}`);
      assert.deepEqual(JSON.parse(call.options.body),{amount:10,currency:'USD'});
    }
    await new XPay({secretKey:'xp_test_fixture',baseUrl:'https://example.test/'}).payments.retrieve('id/with?chars');
    assert.equal(calls.at(-1).url,'https://example.test/v1/payments/id%2Fwith%3Fchars');
  } finally {globalThis.fetch=original;}
});

test('rejects absent keys and exposes API error status', async () => {
  assert.throws(()=>new XPay({}),XPayError);
  assert.throws(()=>new XPay({apiKey:'public_key'}),XPayError);
  const original=globalThis.fetch;
  globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:'Denied',type:'authentication_error'}}),{status:401});
  try {
    await assert.rejects(new XPay({apiKey:'xp_test_fixture'}).payments.retrieve('pay_test'),e=>e instanceof XPayError && e.statusCode===401 && e.message==='Denied');
  } finally {globalThis.fetch=original;}
});

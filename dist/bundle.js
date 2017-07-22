'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var crypto = _interopDefault(require('crypto'));
var querystring = _interopDefault(require('querystring'));
var _ = _interopDefault(require('lodash'));

class btceService {
  constructor({ publicKey, secretKey, nonce = 0 } = {}) {
    this.BTC_E_TRADE_API = 'https://btc-e.nz/tapi/';
    this.BTC_E_PUBLIC_API = 'https://btc-e.nz/api/3/';
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.nonce = nonce;
  }

  incrementNonce() {
    this.nonce += 1;
    return this.nonce;
  }

  generateSignature(body) {
    return crypto
      .createHmac('sha512', new Buffer(this.secretKey))
      .update(new Buffer(body))
      .digest('hex')
      .toString();
  }

  getHeaders(body) {
    return {
      headers: {
        Sign: this.generateSignature(body),
        Key: this.publicKey,
      }
    };
  }

  makeTradeApiRequest(params = {}) {
    if(!this.secretKey) return Promise.reject('Missing secretKey');
    if(!this.publicKey) return Promise.reject('Missing publicKey');

    const url = `${this.BTC_E_TRADE_API}`;

    params.nonce = this.incrementNonce();

    const body = querystring.stringify(params);

    return axios.post(url, body, this.getHeaders(body))
      .then(({data}) => {
        const error = _.get(data, 'error', '');
        const invalidNonce = error.indexOf('invalid nonce parameter') > -1;

        if (invalidNonce) {
          this.nonce = _.chain(data.error).split(':').last().toNumber().value();
          return this.makeTradeApiRequest(params);
        }

        if (error) {
          return Promise.reject(data);
        }

        return data.return;
      });
  }

  makePublicApiRequest({ pair, method, limit = 150 }) {
    if(!method) return Promise.reject('Missing method');
    const url = `${this.BTC_E_PUBLIC_API}${method}/${pair}?limit=${limit}`;
    return axios.post(url)
      .then(({data}) => {
        const error = _.get(data, 'error', '');

        if (error) {
          return Promise.reject(data);
        }

        return data;

      });
  }

  getInfo() {
    return this.makeTradeApiRequest({ method: 'getInfo' });
  }

  transHistory({from, count, from_id, end_id, order, since, end} = {}) {
    return this.makeTradeApiRequest({ method: 'TransHistory', from, count, from_id, end_id, order, since, end });
  }

  tradeHistory({ from, count, from_id, end_id, order, since, end, pair } = {}) {
    return this.makeTradeApiRequest({ method: 'TradeHistory', from, count, from_id, end_id, order, since, end, pair });
  }

  orderInfo(order_id) {
    if (!order_id) return Promise.reject('Missing order_id');
    return this.makeTradeApiRequest({ method: 'OrderInfo', order_id });
  }

  activeOrders(pair) {
    return this.makeTradeApiRequest({ method: 'ActiveOrders', pair });
  }

  trade({pair, type, rate, amount} = {}) {
    if (!pair) return Promise.reject('Missing pair');
    if (!type) return Promise.reject('Missing type');
    if (!rate) return Promise.reject('Missing rate');
    if (!amount) return Promise.reject('Missing amount');
    return this.makeTradeApiRequest({ method: 'Trade', pair, type, rate, amount });
  }

  cancelOrder(order_id) {
    if (!order_id) return Promise.reject('Missing order_id');
    return this.makeTradeApiRequest({method: 'CancelOrder', order_id});
  }

  info() {
    return this.makePublicApiRequest({method: 'info'});
  }

  ticker(pair) {
    if (!pair) return Promise.reject('Missing pair');
    return this.makePublicApiRequest({method: 'ticker', pair: pair});
  }

  trades(pair, limit) {
    if(!pair) return Promise.reject('Missing pair');
    return this.makePublicApiRequest({method: 'trades', pair: pair, limit: limit});
  }

  depth(pair) {
    if (!pair) return Promise.reject('Missing pair');
    return this.makePublicApiRequest({method: 'depth', pair: pair});
  }

  fee(pair) {
    if (!pair) return Promise.reject('Missing pair');
    return this.makePublicApiRequest({method: 'fee', pair: pair});
  }
}

module.exports = btceService;

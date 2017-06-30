# btc-e.com API Wrapper

### Methods:

`const btcE = new BtceService({publicKey: 'PUBLIC' secretKey: 'SECRET'})`

#### Public API (https://btc-e.com/api/3/docs)

btcE.depth(pair)

btcE.fee(pair)

btcE.info()

btcE.ticker(pair)

btcE.trades(pair)

#### Trade API (https://btc-e.com/tapi/docs)

btcE.activeOrders(pair)

btcE.cancelOrder(order_id)

btcE.getInfo()

btcE.orderInfo(order_id)

btcE.trade({ pair, type, rate, amount })

btcE.tradeHistory({ from, count, from_id, end_id, order, since, end, pair })

btcE.transHistory({ from, count, from_id, end_id, order, since, end })

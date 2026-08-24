# Hijiki for Node.js

> Event-driven messaging for RabbitMQ, without the boilerplate.

[![npm](https://img.shields.io/npm/v/hijiki)](https://www.npmjs.com/package/hijiki)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Hijiki is a high-level library for event-driven messaging on RabbitMQ. It wraps
[rascal](https://github.com/guidesmiths/rascal) so you declare queues, exchanges
and bindings through a fluent builder, and register consumers as plain functions —
no manual channel or connection handling.

This is the Node.js implementation. A [Python version](https://github.com/asengardeon/hijiki)
is also available.

## Why

Every service in an event-driven architecture repeats the same setup: declare the
exchange, bind the queue, wire acknowledgements, keep the connection alive. Hijiki
collapses that into a builder and a handler function, with manual acknowledgement
handled for you — the message is acked when your handler returns and nacked when
it throws.

## Install

```shell
npm install hijiki
```

Hijiki is an ES module. Use `import`, and make sure your project has
`"type": "module"` in `package.json` (or use `.mjs` files).

## Quick start

```js
import { HijikiBrokerFactory, HijikiQueueExchange } from 'hijiki';

const queues = [
  new HijikiQueueExchange('orders', 'orders_event'),
];

const manager = new HijikiBrokerFactory()
  .get_instance()
  .with_queues_exchange(queues)
  .with_host('localhost')
  .with_port(5672)
  .with_username('user')
  .with_password('pwd')
  .build();

await manager.add_subscriber('orders', async (content) => {
  console.log('received:', content);
});

await manager.run();
```

A `docker-compose.yml` is included in this repository if you need a local RabbitMQ
to try it against.

## Configuration

The manager is configured with a fluent builder:

| Method | Purpose |
|---|---|
| `with_host(host)` | RabbitMQ broker address |
| `with_port(port)` | Connection port |
| `with_username(username)` | Username |
| `with_password(password)` | Password |
| `with_cluster_servers(servers)` | Comma-separated server list for a clustered instance |
| `with_heartbeat(seconds)` | Heartbeat interval (default `60`) |
| `with_queues_exchange(list)` | Array of `HijikiQueueExchange`, declaring queues and their exchanges |
| `withQueue(queueName, exchangeName)` | Declare a single queue and its exchange |
| `withExchange(exchangeName)` | Declare a single exchange |
| `withBinding(queueName, exchangeName)` | Bind an existing queue to an exchange |
| `with_auto_ack(enabled)` | Acknowledge on delivery instead of after the handler |
| `build()` | Applies the configuration and returns the manager |

Connection settings can also come from the environment, which takes the same
values as the builder:

```
BROKER_SERVER          BROKER_PORT
BROKER_USERNAME        BROKER_PWD
BROKER_CLUSTER_SERVER
```

## Declaring queues and exchanges

`HijikiQueueExchange` pairs a queue with its exchange:

```js
import { HijikiQueueExchange } from 'hijiki';

const queues = [
  new HijikiQueueExchange('orders', 'orders_event'),
  new HijikiQueueExchange('payments', 'payments_event'),
];
```

For finer control, declare each piece explicitly and bind them yourself:

```js
const manager = new HijikiBrokerFactory()
  .get_instance()
  .with_host('localhost')
  .with_username('user')
  .with_password('pwd')
  .with_port(5672)
  .withQueue('orders', 'orders_event')
  .withExchange('orders_audit_event')
  .withBinding('orders', 'orders_audit_event')
  .build();
```

## Consumers

Register handlers, then start consuming. Registration and consumption are separate
steps, so all queues are validated before any message is delivered:

```js
await manager.add_subscriber('orders', async (content) => {
  await processOrder(content);
});

await manager.run();
```

`run()` throws if a registered queue was never declared in the configuration,
which surfaces topology mistakes at startup instead of at runtime.

### Acknowledgement

By default acknowledgement is **manual and automatic for you**: the message is
acked when your handler returns normally, and nacked when it throws. Throwing is
therefore the way to reject a message.

Per-consumer options default to `{ prefetch: 10, automaticAck: false }`:

```js
await manager.add_subscriber('orders', handler, { prefetch: 50 });
```

Set `automaticAck: true` (or call `with_auto_ack(true)` on the manager) to
acknowledge on delivery, before the handler runs.

## Publishing

```js
await manager.publish_message('orders_event', { value: 'order created' });
```

If the exchange has not been declared yet, it is created before publishing.

## Health check

```js
const healthy = await manager.broker.ping();
```

`ping()` publishes to an internal `ping_topic` exchange and returns a boolean —
useful for a liveness or readiness endpoint.

## Shutdown

```js
await manager.terminate();
```

## API surface

```js
import {
  HijikiBrokerFactory,   // entry point: .get_instance() returns a HijikiManager
  HijikiManager,         // builder, consumer registration, publishing
  HijikiBroker,          // broker base class
  HijikiQueueExchange,   // queue + exchange pair
  BrokerConfig,          // low-level configuration object
  InvalidBrokerParameter,
  RABBIT_TYPE,
  BROKER_SERVER, BROKER_PORT, BROKER_USERNAME, BROKER_PWD, BROKER_CLUSTER_SERVER,
} from 'hijiki';
```

## Requirements

- Node.js with ES module support
- A reachable RabbitMQ instance (defaults to `localhost:5672`)

## Tests

```shell
npm test              # unit tests
npm run test_coverage # with coverage
```

Integration tests under `tests/integrated` expect a running RabbitMQ — bring one
up with `docker compose up -d`.

## Also available for

- **Python** → [hijiki](https://github.com/asengardeon/hijiki) ([PyPI](https://pypi.org/project/hijiki/))

## Contributing

Issues and pull requests are welcome. Open an issue to discuss larger changes
before implementing them.

## License

MIT — see [LICENSE](LICENSE).
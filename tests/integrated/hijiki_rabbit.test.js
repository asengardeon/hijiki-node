import HijikiQueueExchange from "../../src/broker/models/queue_exchange";
import Publisher from "../../src/publisher/HijikiPublisher";
import {HijikiBrokerFactory} from "../../src/broker/HijikiBrokerFacotry";

let broker;
let pub;

beforeEach(() => {
    let qs = [
        new HijikiQueueExchange('teste1', 'teste1_event'),
        new HijikiQueueExchange('fila_erro', 'erro_event'),
        new HijikiQueueExchange('without_dlq', 'without_dlq'),
    ]

    broker = new HijikiBrokerFactory().get_instance()
        .with_queues_exchange(qs)
        .with_username("user")
        .with_password("pwd")
        .with_host("localhost")
        .with_port(5672)
        .with_heartbeat_interval(30)
        .with_auto_ack(false)
        .build()

    pub = new Publisher("localhost", "user", "pwd", 5672 )
});

afterEach(() => {
})



test('test publish one message', async () => {
    await pub.publish_message('teste1_event', '{"value": "This is the message"}')
})

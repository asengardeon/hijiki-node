import HijikiQueueExchange from "../../src/broker/models/queue_exchange";
import Publisher from "../../src/publisher/HijikiPublisher";
import {HijikiBrokerFactory} from "../../src/broker/HijikiBrokerFacotry";

let broker;

class BrokerMock {

    init = async () => {
        let qs = [
            new HijikiQueueExchange('teste1', 'teste1_event'),
            new HijikiQueueExchange('fila_erro', 'erro_event'),
            new HijikiQueueExchange('without_dlq', 'without_dlq'),
        ]

        this.broker = await new HijikiBrokerFactory().get_instance()
            .with_queues_exchange(qs)
            .with_username("user")
            .with_password("pwd")
            .with_host("localhost")
            .with_port(5672)
            .with_heartbeat_interval(30)
            .with_auto_ack(false).build()

        this.pub = new Publisher("localhost", "user", "pwd", 5672)
        this.addSubscribers(this.broker)
        this.broker.run()
        return this
    }

    addSubscribers = (broker) => {
        const qargs = {
            'x-queue-type': 'quorum',
            'x-dead-letter-exchange': `teste1_dlq`, 'x-delivery-limit': 10
        }

        broker.connection.createConsumer({
            queue: 'teste1',
            arguments: qargs,
            queueOptions: {durable: true},
            // Optionally ensure an exchange exists
            exchanges: [{exchange: 'teste1_event', type: 'topic'}],
            // With a "topic" exchange, messages matching this pattern are routed to the queue
            queueBindings: [{exchange: 'teste1_event', routingKey: '*'}],
        }, async (msg) => {
            console.log('received message (teste1_event)', msg)
        })
    }


}

let mock
beforeEach(async () => {
    mock = await new BrokerMock().init()
});

afterEach(() => {
    mock = null
})



test('test publish one message', async () => {
   mock.pub.publish_message('teste1_event', '{"value": "This is the message"}')
})

test('test_consume_a_message', async () =>{
   mock.pub.publish_message('teste1_event', '{"value": "This is the message"}')
})

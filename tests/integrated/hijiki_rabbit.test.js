import HijikiQueueExchange from "../../src/broker/models/queue_exchange";
import Publisher from "../../src/publisher/HijikiPublisher";
import {HijikiBrokerFactory} from "../../src/broker/HijikiBrokerFacotry";


class BrokerMock {

    constructor() {
        this.result_event_list = []
    }

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
       broker.add_subscriber("teste1", (msg)=>{
           this.result_event_list.push(`received event with message: ${msg}`)
       })
    }


}

let mock
beforeEach(async () => {
    mock = await new BrokerMock().init()
});

afterEach(() => {
    mock.broker.terminate()
})

const delay = (t, val) => {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
}


test('test publish one message', async () => {
    await mock.broker.publish_message('teste1_event', '{"value": "This is the message"}')
    await delay(1000)
    expect(mock.result_event_list.length).toBe(1)
}, 10000)

test('test_consume_a_message', async () =>{
    await mock.broker.publish_message('teste1_event', '{"value": "This is the message"}')
    await delay(1000)
    expect(mock.result_event_list.length).toBe(1)
}, 10000)

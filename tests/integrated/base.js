import HijikiQueueExchange from "../../src/broker/models/queue_exchange";
import {HijikiBrokerFactory} from "../../src/broker/HijikiBrokerFacotry";

class BrokerMock {

    constructor() {
        this.result_event_list = []
        this.result_event_list_dlq = []
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

        this.addSubscribers(this.broker)
        this.broker.run()
        return this
    }

    addSubscribers = (broker) => {
        broker.add_subscriber("teste1", (msg)=>{
            this.result_event_list.push(`received event with message: ${msg}`)
        })
        broker.add_subscriber("fila_erro", (msg)=>{
            this.result_event_list.push(`received event with message from fila_erro: ${msg}`)
            throw new Error("forçando o erro")
        })
    }
}

const delay = (t, val) => {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(val);
        }, t);
    });
}

export { BrokerMock , delay }

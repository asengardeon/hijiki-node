import HijikiQueueExchange from "../../src/models/queue_exchange.js"
import HijikiBrokerFactory from "../../src/factories/hijiki_broker_factory.js"

class BrokerMock {

    constructor() {
        this.result_event_list = []
        this.result_event_list_dlq = []
    }

    terminate = async () =>{
        this.broker.terminate()
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
            .build()

        this.addSubscribers(this.broker)
        await this.broker.run()
        return this
    }

    addSubscribers = async (broker) => {
        await broker.add_subscriber("teste1", (msg)=>{
            this.result_event_list.push(`received event with message: ${msg}`)
        })
        await broker.add_subscriber("fila_erro", (msg)=>{
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

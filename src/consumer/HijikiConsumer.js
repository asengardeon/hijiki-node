import {ConsumerStatus} from "rabbitmq-client";

class Consumer{

    constructor(broker){
        this.broker = broker;
        this.subs = []
    }

    async process_message(msg, callback){
        callback(msg);
        return ConsumerStatus.ACK
    }

    clear_callbacks(){
        for (const q of this.broker.queues_exchanges) {
            const name = q.name
            if (!this.broker.queues.has(name)) {
                this.broker.queues[name] = []
                this.broker.queues[name + "_dlq"] = []
            }
            if (!this.broker.callbacks.has(name)) {
                this.broker.callbacks[name] = []
                this.broker.callbacks[name + "_dlq"] = []
            }
        }
    }

    get_args_for_queue() {
        const routing_key = "*"
        this.clear_callbacks()
        let result_queues = []
        for (const q of this.broker.queues_exchanges) {
            let name = q.name
            const task_exchange = {exchange: `${q.exchange_name}`, type: 'topic'}
            const qargs = {
                'x-queue-type': 'quorum',
                'x-dead-letter-exchange': `${q.exchange_name}_dlq`, 'x-delivery-limit': 10
            }

            const queue = {
                queue: name,
                queueOptions: {durable: true},
                arguments: qargs,
                exchanges: [task_exchange],
                queueBindings: [{exchange: task_exchange.exchange, routingKey: routing_key}]
            }
            result_queues.push(queue)
        }
        return result_queues
    }


    task(queue_name, callback){
        let queues = this.get_args_for_queue()
        for (const q of queues) {
            let sub = this.broker.connection.createConsumer(q, async (msg) => {
                try{
                    let status = ConsumerStatus.ACK
                    this.process_message(msg.body, callback).then(r => status = r );
                    return status
                }catch (err){
                    if(!this.broker.auto_ack)
                        return ConsumerStatus.REQUEUE
                }
            })

            sub.on('error', (err) => {
                // Maybe the consumer was cancelled, or the connection was reset before a
                // message could be acknowledged.
                console.log(`Consumer error for ${queue_name}`, err)
                if(!this.broker.auto_ack)
                    return ConsumerStatus.REQUEUE
            })
            this.subs.push(sub)
        }
        return this
    }
}

export default Consumer;

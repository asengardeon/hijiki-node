import {ConsumerStatus} from "rabbitmq-client";

class Consumer{

    constructor(broker){
        this.broker = broker;
        this.subs = []
    }

    process_message(msg, callback){
        callback(msg);
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

    internal_create_queues(is_dlq =  false){
        const routing_key = "*"
        this.clear_callbacks()
        let result_queues = []
        const sufix = is_dlq?"_dlq":""
        for (const q of this.broker.queues_exchanges) {
            let name = q.name+sufix
            const task_exchange = {exchange: `${q.exchange_name}${sufix}`, type: 'topic'}

            let qargs = {"x-queue-type": 'quorum'}
            if (!is_dlq){
                qargs = {
                    "x-queue-type": 'quorum',
                    "x-dead-letter-exchange": `${q.exchange_name}_dlq`, 'x-delivery-limit': 10
                }
            }

            const queue = {
                queue: name,
                queueOptions: {durable: true, arguments: qargs},
                exchanges: [task_exchange],
                queueBindings: [{exchange: task_exchange.exchange, routingKey: routing_key}]
            }
            result_queues.push(queue)
        }
        return result_queues
    }

    create_queues() {
        const result = this.internal_create_queues(false)
        const result_dlq = this.internal_create_queues(true)
        return result.concat(result_dlq)
    }

    crete_consumer(queue, callback, is_dlq){
        let sub = this.broker.connection.createConsumer(queue, (msg) => {
            try{
                this.process_message(msg.body, callback);
                return ConsumerStatus.ACK
            }catch (err){
                if(!this.broker.auto_ack && !is_dlq)
                    return ConsumerStatus.REQUEUE
            }
        })

        sub.on('error', (err) => {
            // Maybe the consumer was cancelled, or the connection was reset before a
            // message could be acknowledged.
            console.log(`Consumer error for ${queue_name}`, err)
            if(!this.broker.auto_ack && !is_dlq)
                return ConsumerStatus.REQUEUE
        })
        this.subs.push(sub)
    }
    task(queue_name, callback, is_dlq){
        let q = this.create_queues().find(item => item.queue === queue_name)
        this.crete_consumer(q, callback, is_dlq)
        return this
    }
}

export default Consumer;

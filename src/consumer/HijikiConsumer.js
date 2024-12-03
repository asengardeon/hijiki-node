import {ConsumerStatus} from "rabbitmq-client";

class Consumer{
    constructor(broker){
        this.broker = broker;

        sub.on('error', (err) => {
            // Maybe the consumer was cancelled, or the connection was reset before a
            // message could be acknowledged.
            console.log('consumer error (user-events)', err)
        })
    }

    async process_message(msg, callback){
        callback(msg);
        return ConsumerStatus.ACK
    }

    task(queue_name, callback){

        const sub = this.broker.connection.createConsumer({
            queue: queue_name,
            queueOptions: {durable: true},
        }, async (msg) => {
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
    }
}

export default Consumer;

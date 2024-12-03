import HijikiBroker from "./HijikiBroker";
import {Connection} from "rabbitmq-client";
import {get_broker_url, init_os_environ} from "./brokerData";
import Consumer from "../consumer/HijikiConsumer";

class HijikiRabbit extends HijikiBroker {

    constructor() {
        super();
        this.connection = null
        this.host = ""
        this.cluster_hosts = ""
        this.password = ""
        this.username = ""
        this.queues_exchanges = []
        this.worker = null
        this.port = null
        this.auto_ack = false
        this.queues = new Map()
        this.callbacks = new Map()
    }

    terminate() {
        this.worker.should_stop = True
    }

    with_queues_exchange(queues_exchanges) {
        this.queues_exchanges = queues_exchanges
        return this
    }

    with_username(username) {
        this.username = username
        return this
    }

    with_password( password) {
        this.password = password
        return this
    }

    with_host( host) {
        this.host = host
        return this
    }

    with_cluster_hosts( hosts) {
        this.cluster_hosts = hosts
        return this
    }

    with_port( port) {
        this.port = port
        return this
    }

    with_heartbeat_interval( heartbeat_interval) {
        this.heartbeat_interval = heartbeat_interval
        return this
    }

    with_auto_ack( auto_ack) {
        this.auto_ack = auto_ack
        return this
    }

    async build() {
        init_os_environ(this.host, this.username, this.password, this.port, this.cluster_hosts)
        this.connection = await this.get_connection()
        this.init_queues().then(r =>{} )
        return this
    }

    async get_connection(force_crete_new) {
        if ((!this.connection) || (force_crete_new === true)) {
            this.connection = new Connection(get_broker_url())
            this.connection.on('error', (err) => {
                console.log('RabbitMQ connection error', err)
            })
            this.connection.on('connection', () => {
                console.log('Connection successfully (re)established')
            })
        }
        return this.connection
    }

    ping = async () => {
        let success_ping = false
        let rabbit
        let pub
        let sub
        try {
            rabbit = await this.get_connection()
            sub = rabbit.createConsumer({
                queue: 'ping-queue',
                exchanges: [{exchange: 'ping-exchange', type: 'topic'}],
                queueBindings: [{exchange: 'ping-exchange', routingKey: 'Pong'}],
            }, async (msg) => {
                console.log('received message ping', msg)
                success_ping = true
            })

            pub = rabbit.createPublisher({
                // Enable publish confirmations, similar to consumer acknowledgements
                confirm: true,
                // Optionally ensure the existence of an exchange before we use it
                exchanges: [{exchange: 'ping-exchange', type: 'topic'}]
            })
            await pub.send(
                {exchange: 'ping-exchange', routingKey: 'Pong'}, // metadata
                "PING MESSAGE from Hijiki") // message content

        }
        catch (AMQPConnectionError){
            success_ping = false
        }
        finally {

            if (pub) {
                await pub.close()
            }
            if (sub) {
                await sub.close()
            }
            if (rabbit) {
                await rabbit.close()
            }

        }
        return success_ping
    }

    init_queues = async () => {
        const routing_key = "*"
        for (const q of this.queues_exchanges) {
            const name = q.name
            if (!this.queues.has(name)) {
                this.queues[name] = []
                this.queues[name + "_dlq"] = []
            }
            if (!this.callbacks.has(name)) {
                this.callbacks[name] = []
                this.callbacks[name + "_dlq"] = []
            }

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

            await this.connection.queueDeclare(queue)
            await this.connection.exchangeDeclare({queue: queue.queue, ...task_exchange})
            await this.connection.queueBind({queue: queue.queue, exchange: task_exchange.name})




            const task_exchange_dlq = {exchange: `${q.exchange_name}_dlq`, type: 'topic'}
            const dql_args = {'x-queue-type': 'quorum'}
            const queue_dlq = {
                queue: `${name}_dlq`,
                arguments: dql_args,
                queueOptions: {durable: true},
                exchanges: [task_exchange_dlq],
                queueBindings: [{exchange: task_exchange_dlq.exchange, routingKey: routing_key}]
            }

            this.connection.queueDeclare(queue_dlq)
            this.connection.exchangeDeclare({queue: queue_dlq.queue, ...task_exchange_dlq})
            this.connection.queueBind({queue: queue_dlq.queue, exchange: task_exchange_dlq.name})


            // const c2 = this.connection.createConsumer(queue_dlq, async (msg) =>{log.info(`criando ou validando fila ${queue_dlq.queue}`)})
            // await c2.close()

        }
    }

    publish_message = async (event_name, data) => {
        let payload = {"value": data}

        this.sender = this.connection.createPublisher({
            // Enable publish confirmations, similar to consumer acknowledgements
            confirm: true,
            // Optionally ensure the existence of an exchange before we use it
            exchanges: [{exchange: event_name, type: 'topic'}]
        })

        // Publish a message to a custom exchange
        await this.sender.send({exchange: event_name, routingKey: '*'},  payload) // message content
    }
    add_subscriber = (queue, func) => {
        this.callbacks[queue] = [func]
    }

    run = () =>{
        //remove consumers_without_callbacks
        this.callbacks.forEach((value, key) => {
            if (value)
                this.callbacks.delete(key)
            this.queues.delete(key)
        })
        this.callbacks.forEach((value, key) => {
            new Consumer(this.broker).task(key, value)
        })
    }
}

export default HijikiRabbit

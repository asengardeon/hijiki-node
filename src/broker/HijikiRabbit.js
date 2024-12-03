import HijikiBroker from "./HijikiBroker";
import {Connection} from "rabbitmq-client";
import {get_broker_url, init_os_environ} from "./brokerData";

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

    with_queues_exchange(queue_exchanges) {
        this.queue_exchanges = queue_exchanges
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
        this.connection = this.get_connection()
        await this.init_queues()
        return this
    }

    get_connection() {
        let url = get_broker_url()
        const rabbit = new Connection(url)
        rabbit.on('error', (err) => {
            console.log('RabbitMQ connection error', err)
        })
        rabbit.on('connection', () => {
            console.log('Connection successfully (re)established')
        })
        return rabbit
    }

    ping = async () => {
        let success_ping = false
        let rabbit
        let pub
        let sub
        try {
            rabbit = this.get_connection()
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
        finally {

            if (pub) {
                await pub.close()
            }
            // Stop consuming. Wait for any pending message handlers to settle.
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
            if (this.queues.has(name)) {
                self.queues[name] = []
                self.queues[name + "_dlq"] = []
            }
            if (this.callbacks.has(name)) {
                this.callbacks.get(name).push([])
                this.callbacks.get(name + "_dlq").push([])
            }

            logger.debug("Setting up %s" % name)

            const task_exchange = {name: `${q.exchange_name}`, type: 'topic'}
            const task_exchange_dlq = {name: `${q.exchange_name}_dlq`, type: 'topic'}

            const queue = {
                name: name,
                queueOptions: {durable: true},
                // Optionally ensure an exchange exists
                exchanges: [task_exchange],
                // With a "topic" exchange, messages matching this pattern are routed to the queue
                queueBindings: [{exchange: task_exchange.name, routingKey: routing_key}]
            }
            const queue_dlq = {
                name: `${name}_dlq`,
                queueOptions: {durable: true},
                // Optionally ensure an exchange exists
                exchanges: [task_exchange_dlq],
                // With a "topic" exchange, messages matching this pattern are routed to the queue
                queueBindings: [{exchange: task_exchange_dlq.name, routingKey: routing_key}]
            }
            if (this.queue_exchanges) {
                const qargs = {
                    'x-queue-type': 'quorum',
                    'x-dead-letter-exchange': `{q.exchange_name}_dlq','x-delivery-limit': 10`
                }
                await this.connection.queueDeclare(queue)
                await this.connection.exchangeDeclare(task_exchange)
                await this.connection.queueBind({queue: queue.name, exchange: task_exchange.name, arguments: qargs})
                await this.connection.queueDeclare(queue_dlq)
                await this.connection.exchangeDeclare(task_exchange_dlq)
                await this.connection.queueBind({queue: queue_dlq.name, exchange: task_exchange_dlq.name})
            }
        }
    }

}

export default HijikiRabbit

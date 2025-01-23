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
        this.port = null
        this.auto_ack = false
        this.queues = new Map()
        this.callbacks = new Map()
        this.consumers = []
    }

    terminate() {
        this.connection.close()
        this.consumers.forEach(consumer => {
            consumer.subs.forEach(sub => {
                sub.close()
            })
        })
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
        return this
    }

    async get_connection(force_create_new) {
        if ((!this.connection) || (force_create_new === true)) {
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
        let success_ping = true
        let rabbit
        let pub
        let sub
        const pingQueue = 'ping-queue';
        const pingExchange = 'ping-exchange';
        const pingTopicType = 'topic';
        try {
            rabbit = await this.get_connection()
            sub = rabbit.createConsumer({
                queue: pingQueue,
                exchanges: [{exchange: pingExchange, type: pingTopicType}],
                queueBindings: [{exchange: pingExchange, routingKey: 'Pong'}],
            }, async (msg) => {
                console.log('received message ping', msg)
                success_ping = true
            })

            sub.on('error', (err) => {
                success_ping = false
                console.log(err)
            })
            pub = rabbit.createPublisher({
                // Enable publish confirmations, similar to consumer acknowledgements
                confirm: true,
                // Optionally ensure the existence of an exchange before we use it
                exchanges: [{exchange: pingExchange, type: pingTopicType}]
            })

            await pub.send(
                {exchange: pingExchange, routingKey: 'Pong'}, // metadata
                "PING MESSAGE from Hijiki") // message content
        }
        catch (Error){
            success_ping = false
        }
        finally {

            if (pub) {
                await pub.close()
            }
            if (sub) {
                await sub.close()
            }
        }
        return success_ping
    }

    publish_message = async (event_name, data) => {
        let payload = {"value": data}

        this.sender = this.connection.createPublisher({
            // Enable publish confirmations, similar to consumer acknowledgements
            confirm: true,
            // Optionally ensure the existence of an exchange before we use it
            exchanges: [{exchange: event_name, type: 'topic'}]
        })
        try {
            // Publish a message to a custom exchange
            await this.sender.send({exchange: event_name, routingKey: '*'}, payload) // message content
        }
        finally{
            await this.sender.close()
        }

    }
    add_subscriber = (queue, func) => {
        this.callbacks.set(queue, func)
    }

    run = () =>{
        //remove consumers_without_callbacks
        this.callbacks.forEach((values, keys) => {
            if (!values) {
                this.callbacks.delete(keys)
                this.queues.delete(keys)
            }
        })

        this.callbacks.forEach((value, key) => {
            this.consumers.push(new Consumer(this).task(key, value))
        })
    }
}

export default HijikiRabbit

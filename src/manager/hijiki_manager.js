import HijikiRabbit from "../adapter/hijiki_rabbit.js";
import BrokerConfig from "../broker/broker_config.js";

class HijikiManager {
    constructor() {
        this.broker = new HijikiRabbit();
        this.config = new BrokerConfig()
        this.consumers = [];
        this.config.withExchange("ping_topic")
        this.auto_ack = false
        this.default_options = {prefetch: 10, automaticAck: false}
    }

    async terminate(){
        await this.broker.disconnect()
    }

    with_queues_exchange(queues_exchange){
        this.config.with_queues_exchange(queues_exchange)
        return this;
    }

    with_username(username){
        this.config.with_username(username)
        return this;
    }

    with_password(password){
        this.config.with_password(password)
        return this;
    }

    with_host(host){
        this.config.with_host(host)
        return this;
    }

    with_cluster_servers(servers){
        this.config.with_cluster_servers(servers)
        return this
    }

    with_port(port){
        this.config.with_port(port)
        return this;
    }

    with_auto_ack(auto_ack){
        this.auto_ack = auto_ack
    }

    withQueue(queueName, exchangeName) {
        this.config.withQueue(queueName, exchangeName);
        return this;
    }

    withExchange(exchangeName) {
        this.config.withExchange(exchangeName);
        return this;
    }

    withBinding(queueName, exchangeName) {
        this.config.withBinding(queueName, exchangeName);
        return this;
    }

    with_heartbeat(heartbeat){
        this.config.with_heartbeat(heartbeat)
        return this;
    }

    build() {
        this.broker.with_config(this.config.build());
        return this;
    }

    async add_subscriber(queueName, handler, options = {} ) {
        this.consumers.push({ queueName, handler, options });
    }

    async publish_message(topic, message) {
        const broker = await this.broker.connect();
        // Certifique-se de que o exchange existe antes de publicar
        if (!this.broker.config.vhosts["/"].exchanges[topic]) {
            this.broker.config.withExchange(topic);
        }
        await broker.publish(topic, message);
    }
    async add_new_consumer(queueName, handler, options=this.default_options) {
        const broker = await this.broker.connect();
        const subscriptionName = `/` + queueName; // Ajuste para Rascal usar o nome correto da fila
        const { ack, ...other_options } = options;
        const subscription = await broker.subscribe(subscriptionName, other_options);
        const autoAck = this.auto_ack || options.automaticAck
        subscription.on('message', async (message, content, ackOrNack) => {
            try {
                if (autoAck) {
                    ackOrNack();
                }
                await handler(content);
                if (!autoAck) {
                    ackOrNack();
                }
            } catch (err) {
                if (!autoAck) {
                    ackOrNack(err);
                }
            }
        }).on('error', function(err) {
            console.error('Subscriber error', err)
        }).on('invalid_content', function(err, message, ackOrNack) {
            console.error('Invalid content', err)
            ackOrNack(err)
        });
    }
    async run() {
        // Criar todas as filas e exchanges antes de escutar
        for (const { queueName } of this.consumers) {
            if (!this.broker.config.vhosts["/"].queues[queueName]) {
                throw new Error(`A fila '${queueName}' não foi configurada corretamente.`);
            }
        }
        // Iniciar consumidores nas filas existentes
        for (const { queueName, handler, options } of this.consumers) {
            await this.add_new_consumer(queueName, handler, options);
        }

    }
}

export default HijikiManager

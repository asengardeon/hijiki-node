import HijikiRabbit from "./hijiki_rabbit";
import BrokerConfig from "./broker_config";

class HijikiManager {
    constructor() {
        this.broker = new HijikiRabbit();
        this.config = new BrokerConfig()
        this.consumers = [];
        this.config.withExchange("ping_topic")
        this.auto_ack = false
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

    build() {
        this.broker.with_config(this.config.build());
        return this;
    }

    async add_subscriber(queueName, handler, autoAck = false) {
        this.consumers.push({ queueName, handler, autoAck });
    }

    async publish_message(topic, message) {
        const broker = await this.broker.connect();
        // Certifique-se de que o exchange existe antes de publicar
        if (!this.broker.config.vhosts["/"].exchanges[topic]) {
            this.broker.config.withExchange(topic);
        }
        await broker.publish(topic, message);
    }
    async add_new_consumer(queueName, handler, automaticAck) {
        const broker = await this.broker.connect();
        const subscriptionName = `/` + queueName; // Ajuste para Rascal usar o nome correto da fila
        const subscription = await broker.subscribe(subscriptionName);
        const autoAck = automaticAck || this.auto_ack
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
        for (const { queueName, handler, automaticAck } of this.consumers) {
            await this.add_new_consumer(queueName, handler, automaticAck);
        }

    }
}

export default HijikiManager

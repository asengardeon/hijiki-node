import {get_broker_url, init_os_environ} from "./broker_data.js";
import {InvalidBrokerParameter} from "../exceptions/exceptions.js";

class BrokerConfig {
    constructor() {
        this.config = {
            vhosts: {
                "/": {
                    connectionStrategy: "random",
                    connections: [],
                    exchanges: {},
                    queues: {},
                    bindings: {}
                }
            }
        };

        this.queues_exchange = []
        this.username = ""
        this.password = ""
        this.host = ""
        this.port = 5672
        this.cluster_servers = ""
        this.heartbeat = 60;
    }

    with_heartbeat(heartbeat){
        this.heartbeat = heartbeat
        return this;
    }

    with_queues_exchange(queues_exchange){
        this.queues_exchange = queues_exchange
        return this;
    }

    with_username(username){
        this.username = username
        return this;
    }

    with_password(password){
        this.password = password;
        return this;
    }

    with_host(host){
        this.host = host
        return this;
    }

    with_port(port){
        this.port = port
        return this;
    }

    with_cluster_servers(servers){
        this.cluster_servers = servers
    }

    withQueue(queueName, exchangeName) {
        if (!queueName || !exchangeName) {
            throw new InvalidBrokerParameter('For withQueue, queueName and exchangeName must be defined')
        }
        const dlqName = `${queueName}_dlq`;
        const dlqExchange = `${exchangeName}_dlq`;

        this.withExchange(exchangeName);
        this.withExchange(dlqExchange);

        this.config.vhosts["/"].queues[queueName] = {
            options: {
                arguments: {
                    "x-queue-type": "quorum",
                    "x-dead-letter-exchange": dlqExchange,
                    "x-delivery-limit": 10
                }
            }
        };

        this.config.vhosts["/"].queues[dlqName] = {
            options: {arguments: {
                 "x-queue-type": "quorum" }
            }
        };

        this.withBinding(queueName, exchangeName);
        this.withBinding(dlqName, dlqExchange);
        return this;
    }

    withExchange(exchangeName) {
        if (!exchangeName) {
            throw new InvalidBrokerParameter('For withExchange, exchangeName must be defined')
        }
        this.config.vhosts["/"].exchanges[exchangeName] = {
            type: "topic"
        };

        // Adiciona a publicação correspondente para evitar erro "Unknown publication"
        this.config.vhosts["/"].publications = this.config.vhosts["/"].publications || {};
        this.config.vhosts["/"].publications[exchangeName] = {
            exchange: exchangeName,
            routingKey: "*"
        };

        return this;
    }

    withBinding(queueName, exchangeName) {
        if (!queueName || !exchangeName) {
            throw new InvalidBrokerParameter('For withBinding, queueName and exchangeName must be defined')
        }
        this.config.vhosts["/"].bindings[`${exchangeName}->${queueName}`] = {
            source: exchangeName,
            destination: queueName,
            destinationType: "queue",
            bindingKey: "*"
        };
        return this;
    }


    define_connection () {
        this.config.vhosts["/"].connectionStrategy = "random"
        this.config.vhosts["/"].connections = get_broker_url({heartbeat: this.heartbeat})
        return this;
    }

    define_queues_exchanges () {
        this.queues_exchange.forEach(queueExchange => {
            this.withQueue(queueExchange.name, queueExchange.exchange_name);
        })
    }


    build() {
        init_os_environ(this.host, this.username, this.password, this.port, this.cluster_servers);
        this.define_connection()
        this.define_queues_exchanges()
        return this.config;
    }
}


export default BrokerConfig

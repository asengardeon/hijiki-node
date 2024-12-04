import {HijikiBrokerFactory} from "../broker/HijikiBrokerFacotry";

class Publisher {
    constructor(host, username, password, port, cluster_hosts = [], heartbeat = 60) {
        let broker = new HijikiBrokerFactory().get_instance()
            .with_host(host)
            .with_username(username)
            .with_password(password)
            .with_port(port)
            .with_cluster_hosts(cluster_hosts)
            .with_heartbeat_interval(heartbeat)
        this.connection(broker)
    }

    async connection(broker) {
        let b = await broker.build()
        this.connection = b.connection
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
}
export default Publisher;

import HijikiBroker from "../broker/hijiki_broker.js";
import pkg from 'rascal';
const {BrokerAsPromised} = pkg;


class HijikiRabbit extends HijikiBroker {
    constructor() {
        super();
        this.config = null
        this.broker = null
    }

    async connect() {
        if (!this.broker) {
            console.log(this.config)
            this.config.vhosts['/'].connections.forEach(conn => {console.log(conn)})
            this.config.vhosts['/'].connections
            this.broker = await BrokerAsPromised.create(this.config);
        }
        return this.broker;
    }

    async disconnect() {
        if (this.broker) {
            this.broker.shutdown();
        }
    }

    async ping() {
        try {
            const broker = await this.connect();
            const publication = await broker.publish('ping_topic', { test: 'ping' });
            await publication.on('success', () => true);
            return true;
        } catch (error) {
            return false;
        }
    }

    with_config(config) {
        this.config = config
    }
}


export default HijikiRabbit;

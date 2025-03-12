import HijikiBroker from "../broker/hijiki_broker.js";
import {BrokerAsPromised} from "rascal";

class HijikiRabbit extends HijikiBroker {
    constructor() {
        super();
        this.config = null
        this.broker = null
    }

    async connect() {
        if (!this.broker) {
            console.log(this.config)
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

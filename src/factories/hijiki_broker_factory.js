import {RABBIT_TYPE} from "../broker/broker_data.js";
import HijikiManager from "../manager/hijiki_manager.js";

class HijikiBrokerFactory {
    get_instance(type= RABBIT_TYPE){
        let broker
        if (type === RABBIT_TYPE){
            broker = new HijikiManager()
        }
        return broker
    }
}

export default HijikiBrokerFactory;

import {RABBIT_TYPE} from "./brokerData";
import HijikiRabbit from "./HijikiRabbit";

class HijikiBrokerFactory {
    get_instance(type= RABBIT_TYPE){
        let broker
        if (type === RABBIT_TYPE){
            broker = new HijikiRabbit()
        }
        return broker
    }
}

export {HijikiBrokerFactory};

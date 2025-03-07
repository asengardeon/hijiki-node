import {RABBIT_TYPE} from "./broker_data";
import HijikiManager from "./hijiki_manager";

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

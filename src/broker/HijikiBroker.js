class UnimplementedBrokerException extends Error {}

class HijikiBroker {
    constructor(app_name) {
        this.app_name = app_name;
    }


    get_broker_connection_from_url() {
        throw new UnimplementedBrokerException("Cannot call connection from Interface HijikiBroker")
    }

    ping = async () => {
        throw new UnimplementedBrokerException('Cannot call ping from Interface HijikiBroker');
    }

}

export default HijikiBroker

class HijikiBroker {

    async ping() {
        throw new UnimplementedBrokerException('Cannot call ping from Interface HijikiBroker');
    }
}

export default HijikiBroker;

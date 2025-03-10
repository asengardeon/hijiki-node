import HijikiBrokerFactory from "../../src/factories/hijiki_broker_factory";

test('test_success_ping', async () => {
    let broker = new HijikiBrokerFactory()
        .get_instance()
        .with_host("localhost")
        .with_username("user")
        .with_password("pwd")
        .with_port(5672).build()
    expect(await broker.broker.ping()).toBeTruthy()}, 10000)

test('test_fail_ping', async () => {
    let broker = await new HijikiBrokerFactory()
        .get_instance()
        .with_host("localhost")
        .with_username("user")
        .with_password("wrong_pwd")
        .with_port(5672)
        .build()
    expect(await broker.broker.ping()).toBeFalsy()
}, 100000)

import {HijikiBrokerFactory} from "../../src/broker/HijikiBrokerFacotry";




test('test_success_ping', async () => {
    let broker = await new HijikiBrokerFactory()
        .get_instance()
        .with_host("localhost")
        .with_username("user")
        .with_password("pwd")
        .with_port(5672)
        .build()
    expect(await broker.ping()).toBeTruthy()
})

xtest('test_fail_ping', async () => {
    let broker = await new HijikiBrokerFactory()
        .get_instance()
        .with_host("localhost")
        .with_username("user")
        .with_password("wrong_pwd")
        .with_port(5672)
        .build()
    expect(await broker.ping()).toBeFalsy()
})

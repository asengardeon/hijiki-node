import HijikiRabbit from "../src/broker/HijikiRabbit";
import {Connection} from "rabbitmq-client/lib/Connection";

test('Teste HijikiRabbit contructor', () => {
    let h = new HijikiRabbit()
    expect(h).toBeInstanceOf(HijikiRabbit);
})

test('Test creqte class and attributes is the default', () =>{
    let h = new HijikiRabbit()
    expect(h.connection).toBe(null)
    expect(h.port).toBe(null)
    expect(h.host).toBe("")
    expect(h.cluster_hosts).toBe("")
    expect(h.password).toBe("")
    expect(h.username).toBe("")
    expect(h.queues_exchanges).toStrictEqual([])
    expect(h.auto_ack).toBe(false)
    expect(h.queues).toStrictEqual(new Map())
    expect(h.callbacks).toStrictEqual(new Map())
})

test('Test create connection to cluster', async () =>{
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672,serverB:5672'
    process.env[BROKER_SERVER] = 'singleserver'
    process.env[BROKER_USERNAME] = 'usr'
    process.env[BROKER_PWD] = 'password'
    process.env[BROKER_PORT] = '5427'
    const constructor = jest
     .spyOn(Connection.prototype, 'constructor')
     .mockImplementation((propsOrUrl) => {
        console.log('mocked function');
    });

    const h = new HijikiRabbit()
        .with_password('password')
        .with_username('usr')
        .with_cluster_hosts('server:5672,serverB:5672')
        .with_port('5672')
    const conn = await h.build()
    expect(conn).toBeInstanceOf(HijikiRabbit);
    expect(conn.port).toBe("5672")
    expect(conn.username).toBe('usr')
    expect(conn.password).toBe('password')
    expect(conn.host).toBe('')
    expect(conn.cluster_hosts).toBe('server:5672,serverB:5672')
})





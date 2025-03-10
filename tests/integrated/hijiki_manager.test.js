import HijikiBrokerFactory from "../../src/factories/hijiki_broker_factory";
import HijikiQueueExchange from "../../src/models/queue_exchange";
import BrokerConfig from "../../src/broker/broker_config";


let manager

beforeAll(async () => {
    let qs = [
        new HijikiQueueExchange('teste_manager', 'teste_manager_event')
    ]
    manager = await new HijikiBrokerFactory().get_instance()
        .with_queues_exchange(qs)
        .with_username("user")
        .with_password("pwd")
        .with_host("localhost")
        .with_port(5672)
        .withQueue('test_manager_builder', 'test_manager_builder_event')
        .withExchange('test_manager_builder_2_event')
        .withBinding('test_manager_builder', 'test_manager_builder_2_event' )
        .build()
    manager.run()
});


test('test hijiki manager builder - QUEUES', async () => {
    expect(manager.config).toBeInstanceOf(BrokerConfig)
    expect(manager.broker.config.vhosts['/'].queues['test_manager_builder']).toBeInstanceOf(Object)
    expect(manager.broker.config.vhosts['/'].exchanges['test_manager_builder']).toBeUndefined()
    expect(manager.broker.config.vhosts['/'].bindings['test_manager_builder']).toBeUndefined()
})


test('test hijiki manager builder - EXCHANGES', async () => {
    expect(manager.config).toBeInstanceOf(BrokerConfig)
    expect(manager.broker.config.vhosts['/'].queues['test_manager_builder_event']).toBeUndefined()
    expect(manager.broker.config.vhosts['/'].exchanges['test_manager_builder_event']).toBeInstanceOf(Object)
    expect(manager.broker.config.vhosts['/'].bindings['test_manager_builder_event']).toBeUndefined()
})


test('test hijiki manager builder - Throws', async () => {
    try{
        manager.config.withQueue('fake')
        throw Error('failed test')
    }
    catch (error) {
        expect(error.message).toBe('For withQueue, queueName and exchangeName must be defined')
    }

    try{
        manager.config.withExchange()
        throw Error('failed test')
    }
    catch (error) {
        expect(error.message).toBe('For withExchange, exchangeName must be defined')
    }

    try{
        manager.config.withBinding('fake')
        throw Error('failed test')
    }
    catch (error) {
        expect(error.message).toBe('For withBinding, queueName and exchangeName must be defined')
    }
})

import {
    BROKER_CLUSTER_SERVER, BROKER_PORT,
    BROKER_PWD,
    BROKER_SERVER,
    BROKER_USERNAME,
    get_broker_url
} from "../src/broker/brokerData";
import {CLUSTER_NODE, SINGLE_NODE} from "../src/broker/consts";


beforeEach(() => {
    process.env[BROKER_SERVER] = 'teste'
});

afterEach(() => {
    delete process.env.BROKER_SERVER
    delete process.env.BROKER_USERNAME
    delete process.env.BROKER_PWD
    delete process.env.BROKER_PORT
    delete process.env.BROKER_CLUSTER_SERVER
});


test('Test getBorker_url', () => {
    const uri = get_broker_url()
    expect(uri.type).toBe(SINGLE_NODE)
    expect(uri.host).toBe("amqp://null:null@teste:5672")
});

test('test_broker_username_env_not_exists_in_environment_variable_but_server_exists', () => {
    const uri = get_broker_url()
    expect(uri.type).toBe(SINGLE_NODE)
    expect(uri.host).toBe( 'amqp://null:null@teste:5672')
})

test('test_broker_pwd_env_not_exists_in_environment_variable_but_server_exists', () => {
    const uri = get_broker_url()
    expect(uri.type).toBe(SINGLE_NODE)
    expect(uri.host).toBe('amqp://null:null@teste:5672')
})

test('test_broker_port_env_not_exists_in_environment_variable_but_server_exists', () => {
    const uri = get_broker_url()
    expect(uri.type).toBe(SINGLE_NODE)
    expect(uri.host).toBe( 'amqp://null:null@teste:5672')
})

test('test_broker_server_env_exists_in_environment_variable', () => {
    const uri = get_broker_url()
    expect(uri.type).toBe(SINGLE_NODE)
    expect(uri.host).toBe('amqp://null:null@teste:5672', get_broker_url())

})


test('test_alldata_env_exists_in_environment_variable', () => {
    process.env[BROKER_SERVER] = 'server'
    process.env[BROKER_USERNAME] = 'usr'
    process.env[BROKER_PWD] = 'password'
    process.env[BROKER_PORT] = '5427'
    const uri = get_broker_url()
    expect(uri.type).toBe(SINGLE_NODE)
    expect(uri.host).toBe( 'amqp://usr:password@server:5427')
})

test('test_broker_cluster_server_env_exists_in_environment_variable', () => {
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672'
    const uri = get_broker_url()
    expect(uri.type).toBe(CLUSTER_NODE)
    expect(uri.host).toContain('server:5672');
    expect(uri.host).not.toContain('serverB:5672')
})

test('test_multiples_broker_cluster_server_env_exists_in_environment_variable', () => {
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672,serverB:5672'
    const uri = get_broker_url()
    expect(uri.type).toBe(CLUSTER_NODE)
    expect(uri.host).toContain('server:5672');
    expect(uri.host).toContain('serverB:5672');
})

test('test_broker_cluster_server_env_exists_in_environment_variable_and_single_server_exists', () => {
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672,serverB:5672'
    process.env[BROKER_SERVER] = 'singleserver'
    process.env[BROKER_USERNAME] = 'usr'
    process.env[BROKER_PWD] = 'password'
    process.env[BROKER_PORT] = '5427'
    const uri = get_broker_url()
    expect(uri.type).toBe(CLUSTER_NODE)
    expect(uri.host).toContain('server:5672');
    expect(uri.host).toContain('serverB:5672');

})

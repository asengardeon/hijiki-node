import {
    BROKER_CLUSTER_SERVER, BROKER_PORT,
    BROKER_PWD,
    BROKER_SERVER,
    BROKER_USERNAME,
    get_broker_url
} from "../src/broker/broker_data.js";


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
    expect(get_broker_url()).toContain("amqp://null:null@teste:5672")
});

test('test_broker_username_env_not_exists_in_environment_variable_but_server_exists', () => {
    expect(get_broker_url()).toContain( 'amqp://null:null@teste:5672')
})

test('test_broker_pwd_env_not_exists_in_environment_variable_but_server_exists', () => {
    expect(get_broker_url()).toContain('amqp://null:null@teste:5672')
})

test('test_broker_port_env_not_exists_in_environment_variable_but_server_exists', () => {
    expect(get_broker_url()).toContain( 'amqp://null:null@teste:5672')
})

test('test_broker_server_env_exists_in_environment_variable', () => {
    expect(get_broker_url()).toContain('amqp://null:null@teste:5672', get_broker_url())
})


test('test_alldata_env_exists_in_environment_variable', () => {
    process.env[BROKER_SERVER] = 'server'
    process.env[BROKER_USERNAME] = 'usr'
    process.env[BROKER_PWD] = 'password'
    process.env[BROKER_PORT] = '5427'
    expect(get_broker_url()).toContain( 'amqp://usr:password@server:5427')
})

test('test_broker_cluster_server_env_exists_in_environment_variable', () => {
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672'
    expect(get_broker_url()).toContain('amqp://null:null@server:5672')
})

test('test_multiples_broker_cluster_server_env_exists_in_environment_variable', () => {
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672,serverB:5672'
    expect(get_broker_url()).toContain('amqp://null:null@server:5672')
    expect(get_broker_url()).toContain('amqp://null:null@serverB:5672')
})

test('test_broker_cluster_server_env_exists_in_environment_variable_and_single_server_exists', () => {
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672,serverB:5672'
    process.env[BROKER_SERVER] = 'singleserver'
    process.env[BROKER_USERNAME] = 'usr'
    process.env[BROKER_PWD] = 'password'
    process.env[BROKER_PORT] = '5427'
    const servers = get_broker_url()
    expect(servers).toContain("amqp://usr:password@server:5672")
})


test('test_broker_cluster_server_env_exists_in_environment_variable_and_single_server_exists_and_using_heartbeat', () => {
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672,serverB:5672'
    process.env[BROKER_SERVER] = 'singleserver'
    process.env[BROKER_USERNAME] = 'usr'
    process.env[BROKER_PWD] = 'password'
    process.env[BROKER_PORT] = '5427'
    let heartbeat_options = {heartbeat: 10}
    const servers = get_broker_url(heartbeat_options)
    expect(servers).toContain("amqp://usr:password@server:5672?heartbeat=10")
})

test('test_broker_cluster_server_env_exists_in_environment_variable_and_single_server_exists_and_using_heartbeat_greater)than_60', () => {
    process.env[BROKER_CLUSTER_SERVER] = 'server:5672,serverB:5672'
    process.env[BROKER_SERVER] = 'singleserver'
    process.env[BROKER_USERNAME] = 'usr'
    process.env[BROKER_PWD] = 'password'
    process.env[BROKER_PORT] = '5427'
    let heartbeat_options = {heartbeat: 70}
    const servers = get_broker_url(heartbeat_options)
    expect(servers).toContain("amqp://usr:password@server:5672?heartbeat=70")
})

import {BrokerMock, delay} from "./base";

let mock

beforeEach(async () => {
    mock = await new BrokerMock().init()
});

afterEach(() => {
    mock.broker.terminate()
})


test('test publish one message', async () => {
    await delay(1000)
    mock.broker.publish_message('teste1_event', '{"value": "This is the message"}')
    await delay(1000)
    expect(mock.result_event_list.length).toEqual(1)
}, 10000)

test('test_consume_a_message', async () =>{
    await delay(3000)
    mock.broker.publish_message('teste1_event', '{"value": "This is the message"}')
    await delay(3000)
    expect(mock.result_event_list.length).toEqual(1)
}, 10000)



test('test_consume_a_message_failed_with_auto_ack_dont_go_to_DLQ', async () => {
    mock.broker.with_auto_ack(true)
    mock.broker.publish_message('erro_event', `{"value": "This is the error message" ${Date.now()}}`)
    await delay(3000)
    expect(mock.result_event_list.length).toEqual(1)
}, 10000)



test('test_consume_a_message_dlq', async () => {
    mock.broker.add_new_consumer('fila_erro_dlq', (msg) => {
        mock.result_event_list_dlq.push(`received event with message from fila_erro: ${msg} ${Date.now()}`)
        console.log("EITA PASSOU AQUI")
    }, true)
    await delay(5000)
    mock.broker.publish_message('erro_event', `{"value": "This is the error message"} ${Date.now()}`)
    await delay(1000)
    expect(mock.result_event_list_dlq.length).toEqual(1)
}, 10000)



import {BrokerMock, delay} from "./base.js";

let mock

beforeEach(async () => {
    mock = await new BrokerMock().init()
});

afterEach(() => {
    mock.broker.terminate()
})


xtest('internal_consumer_erro', async () => {
    mock.broker.publish_message('erro_event', `{"value": "This is the error message"} ${Date.now()}`)
    await delay(3000)
    expect(mock.result_event_list.length).toBe(11)
    await delay(3000)
}, 10000)

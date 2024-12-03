import HijikiRabbit from "../src/broker/HijikiRabbit";

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
    expect(h.worker).toBe(null)
    expect(h.queues_exchanges).toStrictEqual([])
    expect(h.auto_ack).toBe(false)
    expect(h.queues).toStrictEqual(new Map())
    expect(h.callbacks).toStrictEqual(new Map())
})




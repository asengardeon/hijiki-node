import HijikiRabbit from "../src/broker/HijikiRabbit";

test('Teste HijikiRabbit contructor', () => {
    let h = new HijikiRabbit()
    expect(h).toBeInstanceOf(HijikiRabbit);
})

test('Test creqte class and attributes is the default', () =>{
    let h = new HijikiRabbit()
    expect(h.config).toBe(null)
    expect(h.broker).toBe(null)
})




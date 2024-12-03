import HijikiBroker from "../src/broker/HijikiBroker";

test("Test call ping to HijikiBroker", async () => {
    let go= false
    try {
        let h;
        h = new HijikiBroker("", "", "", "", "", "", "")
        await h.ping()
    }
    catch (e){
        go = e.message === "Cannot call ping from Interface HijikiBroker"
    }
    expect(go).toBeTruthy()
})

test("Test call connection to HijikiBroker", async () => {
    let go;
    go = false
    try {
        let h;
        h = new HijikiBroker("", "", "", "", "", "", "")
        h.get_broker_connection_from_url()
    }
    catch (e){
        go = e.message === "Cannot call connection from Interface HijikiBroker"
    }
    expect(go).toBeTruthy()
})



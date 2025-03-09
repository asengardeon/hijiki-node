import {CLUSTER_NODE, SINGLE_NODE} from "./consts";

const BROKER_PORT = "BROKER_PORT"
const BROKER_PWD = "BROKER_PWD"
const BROKER_USERNAME = "BROKER_USERNAME"
const BROKER_SERVER = "BROKER_SERVER"
const BROKER_CLUSTER_SERVER = "BROKER_CLUSTER_SERVER"
const RABBIT_TYPE = "RABBITMQ"


const build_cluster_uri = (cluster_server, username, password) =>{
    const serverList = cluster_server.split(',')
    return serverList.map(server =>
        `amqp://${username}:${password}@${server}`
    )
}

const init_os_environ = (host, username, password, port, cluster_servers) => {
    if (cluster_servers)
        process.env[BROKER_CLUSTER_SERVER] = cluster_servers
    if (host)
        process.env[BROKER_SERVER] = host
    if (username)
        process.env[BROKER_USERNAME] = username
    if (password)
        process.env[BROKER_PWD] = password
    if (port)
        process.env[BROKER_PORT] = port
}


const get_broker_url = () => {
    const cluster_server =  BROKER_CLUSTER_SERVER in process.env ? process.env[BROKER_CLUSTER_SERVER]: null
    const server = BROKER_SERVER in process.env ? process.env[BROKER_SERVER] : null
    const username = BROKER_USERNAME in process.env ? process.env[BROKER_USERNAME] : null
    const pwd = BROKER_PWD in process.env ? process.env[BROKER_PWD] : null
    const port = BROKER_PORT in process.env ? process.env[BROKER_PORT] : "5672"
    let res = {type: null, host: null}
    if (cluster_server){
        res.type = CLUSTER_NODE
        res.host = cluster_server.split(',')
    } else {
        res.type = SINGLE_NODE
        res.host = server ? `amqp://${username}:${pwd}@${server}:${port}` : 'amqp://rabbitmq:rabbitmq@localhost:5672'
    }
    return res
}


export {get_broker_url, init_os_environ, BROKER_SERVER, BROKER_PWD, BROKER_PORT, BROKER_CLUSTER_SERVER, BROKER_USERNAME, RABBIT_TYPE}

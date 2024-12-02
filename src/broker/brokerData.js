
const BROKER_PORT = "BROKER_PORT"
const BROKER_PWD = "BROKER_PWD"
const BROKER_USERNAME = "BROKER_USERNAME"
const BROKER_SERVER = "BROKER_SERVER"
const BROKER_CLUSTER_SERVER = "BROKER_CLUSTER_SERVER"



const build_cluster_uri = (cluster_server, username, password) =>{
    let servers = cluster_server.split(',')
    let uri = ""
    servers.forEach(server => {uri += `amqp://${username}:${password}@${server};`})
    return uri
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
    let res
    if (cluster_server)
        res = build_cluster_uri(cluster_server, username, pwd)
    else
        res = server ? `amqp://${username}:${pwd}@${server}:${port}`  : 'amqp://rabbitmq:rabbitmq@localhost:5672'
    return res
}


export {get_broker_url, init_os_environ, BROKER_SERVER, BROKER_PWD, BROKER_PORT, BROKER_CLUSTER_SERVER, BROKER_USERNAME}

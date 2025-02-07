const config = require('config')
const Hyperswarm = require('hyperswarm')
const Corestore = require('corestore')

// the sore...
const store = new Corestore(config.get('testClient.path'))
await store.ready()

// Get a core from the store and append to it
const core = store.get({ name: config.get('testClient.coreName') })
await core.ready()

await core.append(['hello', 'world'])

// Keep appending data
setInterval(() => { core.append(['hello', 'delayed']); console.log('extra') }, 5000)

// note some info on the core...
console.log("DiscoveryKey", core.discoveryKey.toString('hex'))
console.log("PublicKey", core.key.toString('hex'))

// Create a hyperswarm and advertise the core to any interested peers
const swarm = new Hyperswarm()
swarm.on('connection', (conn, peerInfo) => {
    console.log('Seen connection from peer')
    store.replicate(conn)
})

const topicKey = config.get('hyperswarm.topicKey')
const topic = Buffer.from(topicKey, 'hex')
swarm.join(topic)

// a second core
const other = store.get({ name: config.get('testClient.coreName') + 'other' })
await other.ready()
await other.append(['hello', 'world'])
swarm.join(other.discoveryKey)
console.log("Other DiscoveryKey", other.discoveryKey.toString('hex'))
console.log("Other PublicKey", other.key.toString('hex'))

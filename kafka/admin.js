const {kafka} = require('./client');

const producer = kafka.producer();

async function init() {
    const admin = kafka.admin();
    console.log('Admin connecting');
    admin.connect();
    console.log('Admin Connection Success');
    console.log('Creating topic pool system')
    await admin.createTopics({
        topics:[{
            topic: 'pool-system',
            numPartitions: 1
        }]
    })
    console.log('topic created success');
    await admin.disconnect();
    console.log('Disconnecting admin');
}

init();
// zookeper server to run => for interacting with kafka
// 2181 port

// kafka runs on port 9192

// admin - infra setup - topics create, partitions create
// producer - message produce
// consumer - consume message
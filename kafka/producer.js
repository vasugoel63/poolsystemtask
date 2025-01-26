const {kafka} = require('./client');

async function init(){
    const producer = kafka.producer();

    console.log('Producer connected');
    await producer.connect();
    console.log('Producer connected successfully');

    await producer.send({
        topic: 'pool-system',
        messages: [
            {value: JSON.stringify({userId: '2', answer: 'yes', timestamp: new Date().toISOString()})
        }
        ]
    });

    producer.disconnect();
}
init();
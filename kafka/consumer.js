const {kafka} = require('./client');

async function runConsumer() {
    const consumer = kafka.consumer({ groupId: "user-1" });
    await consumer.connect();

    await consumer.subscribe({ topics: ["pool-system"], fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const messageValue = JSON.parse(message.value.toString());
            console.log(`Received message: ${JSON.stringify(messageValue)}`);

        },
    });
}


runConsumer();


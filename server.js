const express = require("express");
const http = require("http");
const userRoutes = require("./routes/userRoutes");
const poolRoutes = require("./routes/poolRoutes");
const { kafka } = require('./kafka/client');
const WebSocket = require('ws');
const wsServer = require('./websocket');
const app = express();
app.use(express.json());

app.use('/', userRoutes);
app.use('/',poolRoutes);


app.get('/', (req, res) => {
    res.send("It's working");
});

const httpServer = http.createServer(app);


httpServer.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
    });
});

async function runConsumer() {
    const consumer = kafka.consumer({ groupId: "user-1" });
    await consumer.connect();

    await consumer.subscribe({ topics: ["pool-system"], fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const messageValue = JSON.parse(message.value.toString());
            console.log(`Received message: ${JSON.stringify(messageValue)}`);

            wsServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageValue));
                }
            });
        },
    });
}

runConsumer().catch(console.error);
const clients = [];
wsServer.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    clients.push(ws);
    ws.on("message", (msg) => {
        console.log("Received from client:", msg);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });
});
const PORT = 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

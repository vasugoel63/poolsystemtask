const WebSocket = require('ws');

const wsServer = new WebSocket.Server({ noServer: true });

module.exports = wsServer;
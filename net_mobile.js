const net = require('./net');
const settings = require('./settings');

const server = new net.Server(connection => {
}, (connection, data) => {
});

server.start(settings.settings.net.mobile.port);

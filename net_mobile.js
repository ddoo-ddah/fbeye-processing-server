const net = require('./lib/net');
const settings = require('./settings');

const server = new net.Server();

server.listen(settings.settings.net.mobile.port);

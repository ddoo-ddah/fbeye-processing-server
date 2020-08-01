const net = require('./net');

// 포트 번호
const port = 10100;

const server = new net.Server(connection => {
}, (connection, data) => {
});

server.start(port);

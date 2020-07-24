const tls = require('tls');
const fs = require('fs');

const connections = [];
let i = 0;

const server = tls.createServer({
    key: fs.readFileSync('privkey.key'),
    cert: fs.readFileSync('cert.crt')
}, socket => {
    const connection = {
        id: i++,
        socket,
        address: socket.address()
    };
    connections.push(connection);
    console.log(connection.address, `is connected. ${connection.id}`);

    socket.on('data', data => {
        console.log(`${connection.id}: ${data.toString()}`);
    }).on('end', () => {
        console.log(connection.address, `is disconnected. ${connection.id}`);
        connections.splice(connections.indexOf(connection), 1);
    });
}).on('error', err => {
    console.error(err);
});

server.listen(9000, () => {
    console.log('listen', server.address());
});

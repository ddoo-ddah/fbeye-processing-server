const tls = require('tls');
const fs = require('fs');

let server;
let connections;

const open = (onConnectedCallback, onReceivedCallback) => {
    connections = [];
    let i = 0;

    server = tls.createServer({
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
            if (typeof onReceivedCallback == 'function') {
                onReceivedCallback(connection, data);
            }
        }).on('end', () => {
            console.log(connection.address, `is disconnected. ${connection.id}`);
            connections.splice(connections.indexOf(connection), 1);
        }).on('error', err => {
            console.error(err);
            connections.splice(connections.indexOf(connection), 1);
        });

        if (typeof onConnectedCallback == 'function') {
            onConnectedCallback(connection);
        }
    }).on('error', err => {
        console.error(err);
    });
};

const start = port => {
    server.listen(port, () => {
        console.log('listen', server.address());
    });
};

module.exports = {
    connections, open, start
};

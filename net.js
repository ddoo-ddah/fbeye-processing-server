const tls = require('tls');
const fs = require('fs');

const options = {
    key: fs.readFileSync('privkey.key'),
    cert: fs.readFileSync('cert.crt')
};

const Server = class {
    constructor(onConnectedCallback, onReceivedCallback) {
        this.connections = [];
        let i = 0;

        this.server = tls.createServer(options, socket => {
            const connection = {
                id: i++,
                socket,
                address: socket.address()
            };
            this.connections.push(connection);
            console.log(connection.address, `is connected. ${connection.id}`);

            socket.on('data', data => {
                if (typeof onReceivedCallback === 'function') {
                    onReceivedCallback(connection, data);
                }
            }).on('end', () => {
                console.log(connection.address, `is disconnected. ${connection.id}`);
                this.connections.splice(this.connections.indexOf(connection), 1);
            }).on('error', err => {
                console.error(err);
                this.connections.splice(this.connections.indexOf(connection), 1);
            });

            if (typeof onConnectedCallback === 'function') {
                onConnectedCallback(connection);
            }
        }).on('error', err => {
            console.error(err);
        });
    }

    start(port) {
        this.server.listen(port, () => {
            console.log('listen', this.server.address());
        });
    }
};

module.exports = {
    Server
};

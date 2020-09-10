const tls = require('tls');
const EventEmitter = require('events');
const settings = require('../settings');

class Server {
    constructor() {
        this.emitter = new EventEmitter();
        this.name = 'server';

        this.connections = [];
        let i = 0;

        this.server = tls.createServer({
            key: settings.net.key,
            cert: settings.net.cert
        }, socket => { // 소켓이 연결됐을 때
            const connection = {
                id: i++,
                socket,
                address: `{ address: ${socket.remoteAddress}, family: ${socket.remoteFamily}, port: ${socket.remotePort} }`,
                write: data => {
                    socket.write(data);
                    console.log(`${this.name}: Data sent to ${connection.id}. (size: ${data.length}) ${data}`);
                }
            };
            this.connections.push(connection);
            console.log(`${this.name}: ${connection.address} is connected. ${connection.id}/${this.connections.length}`);
            this.printConnections();

            socket.on('data', data => { // 데이터를 받았을 때
                console.log(`${this.name}: Data received from ${connection.id}. (size: ${data.length}) ${data}`);
                this.emitter.emit('data', connection, data);
            }).on('end', () => { // FIN 패킷을 받았을 때
                this.emitter.emit('end', connection);
            }).on('close', hadError => { // 소켓이 완전히 닫혔을 때
                this.connections.remove(connection);
                console.log(`${this.name}: ${connection.address} is disconnected. ${connection.id}/${this.connections.length} (hadError: ${hadError})`);
                this.printConnections();
                this.emitter.emit('close', connection, hadError);
            }).on('error', err => { // 오류가 발생했을 때
                console.error(err);
                socket.destroy(err);
                this.connections.remove(connection);
            });

            this.emitter.emit('connect');
        }).on('error', err => {
            console.error(err);
        });
    }

    listen(port) {
        this.server.listen(port, () => {
            console.log(`${this.name}: listen`, this.server.address());
            this.emitter.emit('listen');
        });
    }

    printConnections() {
        if (this.connections.length > 0) {
            const arr = [];
            this.connections.forEach(e => {
                arr.push(`${e.id}: ${e.address}`);
            });
            console.log(`${this.name}: ${arr}`);
        }
    }
}

module.exports = {
    Server
};

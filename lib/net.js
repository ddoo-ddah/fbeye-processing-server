const tls = require('tls');
const EventEmitter = require('events');
const settings = require('../settings');

class Server {
    constructor() {
        this.emitter = new EventEmitter();

        this.connections = [];
        let i = 0;

        this.server = tls.createServer({
            key: settings.settings.net.key,
            cert: settings.settings.net.cert
        }, socket => { // 소켓이 연결됐을 때
            const connection = {
                id: i++,
                socket,
                address: `{ port: ${socket.remotePort}, family: ${socket.remoteFamily}, address: ${socket.remoteAddress} }`,
                write(data) {
                    socket.write(data);
                    console.log(`Data sent to ${connection.id}. (size: ${data.length})`);
                }
            };
            this.connections.push(connection);
            console.log(`${connection.address} is connected. ${connection.id}`);

            socket.on('data', data => { // 데이터를 받았을 때
                console.log(`Data received from ${connection.id}. (size: ${data.length})`);
                this.emitter.emit('data', connection, data);
            }).on('end', () => { // FIN 패킷을 받았을 때
                console.log(`${connection.address} is disconnected. ${connection.id}`);
                this.connections.remove(connection);
                this.emitter.emit('end', connection);
            }).on('close', hadError => { // 소켓이 완전히 닫혔을 때
                console.log(`${connection.address} is disconnected. ${connection.id} (hadError: ${hadError})`);
                this.connections.remove(connection);
                this.emitter.emit('close', connection, hadError);
            }).on('error', err => { // 오류가 발생했을 때
                console.error(err);
            });

            this.emitter.emit('connect');
        }).on('error', err => {
            console.error(err);
        });
    }

    listen(port) {
        this.server.listen(port, () => {
            console.log('listen', this.server.address());
            this.emitter.emit('listen');
        });
    }
}

module.exports = {
    Server
};

const net = require('./lib/net');
const protocol = require('./protocol');
const sign = require('./sign');
const exam = require('./exam');
const user = require('./user');
const answer = require('./answer');
const settings = require('./settings');

const server = new net.Server();

server.emitter.on('data', async (connection, data) => {
    const obj = protocol.toObject(data);
    if (obj.type === 'sin') {
        const result = await sign.signIn(obj.data.exam, obj.data.user);
        if (result) {
            connection.socket.write(protocol.toBuffer({
                type: 'res',
                data: 'ok'
            }));
            sign.setDesktop(obj.data.exam, obj.data.user, connection);
        }
    } else if (obj.type === 'ans') {
        answer.submit(obj.data.exam, obj.data.user, obj.data.answers);
    }
});

server.listen(settings.settings.net.desktop.port);

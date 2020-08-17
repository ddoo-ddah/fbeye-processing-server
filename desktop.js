const net = require('./lib/net');
const protocol = require('./protocol');
const exam = require('./exam');
const user = require('./user');
const settings = require('./settings');

const server = new net.Server();
const process = new Map();

server.emitter.on('data', (connection, data) => {
    const obj = protocol.toObject(data);
    process.get(obj.type)(connection, obj.data);
});

process.set('sin', async (connection, data) => {
    const result = await user.signIn(data.exam, data.user);
    if (result) {
        connection.socket.write(protocol.toBuffer({
            type: 'res',
            data: 'ok'
        }));
        user.setDesktop(data.exam, data.user, connection);
    }
});

process.set('ans', (connection, data) => {
    exam.submitAnswers(data.exam, data.user, data.answers);
});

server.listen(settings.settings.net.desktop.port);

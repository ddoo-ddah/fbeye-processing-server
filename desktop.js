const net = require('./lib/net');
const protocol = require('./protocol');
const exam = require('./exam');
const user = require('./user');
const settings = require('./settings');

const server = new net.Server();
const process = new Map();

server.emitter.on('data', (connection, data) => {
    const obj = protocol.toObject(data);
    const func = process.get(obj.type);
    if (typeof func === 'function') {
        func(connection, obj.data);
    }
});

process.set('sin', async (connection, data) => {
    const result = await user.signIn(data.exam, data.user);
    if (result) {
        connection.socket.write(protocol.toBuffer({
            type: 'res',
            data: 'ok'
        }));
        user.setDesktop(data.exam, data.user, connection);

        const examInfo = await exam.getExamInformation(data.exam);
        connection.socket.write(protocol.toBuffer({
            type: 'inf',
            data: examInfo
        }));
        const userInfo = await user.getUserInformation(data.user);
        connection.socket.write(protocol.toBuffer({
            type: 'usrinf',
            data: userInfo
        }));
    }
});

process.set('ans', (connection, data) => {
    exam.submitAnswers(data.exam, data.user, data.answers);
});

server.listen(settings.settings.net.desktop.port);

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

process.set('SIN', async (connection, data) => {
    const result = await user.signIn(data.exam, data.user);
    if (result) {
        connection.write(protocol.toBuffer({
            type: 'RES',
            data: 'ok'
        }));
        user.setDesktop(data.exam, data.user, connection);

        const examInfo = await exam.getExamInformation(data.exam);
        connection.write(protocol.toBuffer({
            type: 'INF',
            data: examInfo
        }));
        const userInfo = await user.getUserInformation(data.user);
        connection.write(protocol.toBuffer({
            type: 'USRINF',
            data: userInfo
        }));
    }
});

process.set('ANS', (connection, data) => {
    exam.submitAnswers(data.exam, data.user, data.answers);
});

server.emitter.on('close', async (connection, hadError) => {
    const userCode = await user.getUserCodeFromDesktop(connection);
    user.signOut(userCode);
});

server.listen(settings.settings.net.desktop.port);

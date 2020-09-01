const net = require('./lib/net');
const protocol = require('./protocol');
const exam = require('./exam');
const user = require('./user');
const settings = require('./settings');

const server = new net.Server();
const process = new Map();

server.name = 'desktop';

server.emitter.on('data', (connection, data) => {
    const obj = protocol.toObject(data);
    const func = process.get(obj.type);
    if (typeof func === 'function') {
        func(connection, obj.data);
    }
});

process.set('REQ', async (connection, data) => {
    const u = await user.getUserByDesktop(connection);
    if (u.mobile) {
        u.mobile.write(protocol.toBuffer({
            type: 'REQ',
            data
        }));
    }
});

process.set('SIN', async (connection, data) => {
    const result = await user.signIn(data.examCode, data.userCode);
    if (result) {
        connection.write(protocol.toBuffer({
            type: 'RES',
            data: 'ok'
        }));
        user.setDesktop(data.examCode, data.userCode, connection);

        const examInfo = await exam.getExamInformation(data.examCode); // 시험 정보
        connection.write(protocol.toBuffer({
            type: 'INF',
            data: examInfo
        }));
        const userInfo = await user.getUserInformation(data.userCode); // 응시자 정보
        connection.write(protocol.toBuffer({
            type: 'USRINF',
            data: userInfo
        }));

        const questions = await exam.encryptQuestions(await exam.getQuestions(data.examCode)); // 시험 문제
        connection.write(protocol.toBuffer({
            type: 'QUE',
            data: questions
        }));
    }
});

process.set('ANS', (connection, data) => {
    exam.submitAnswers(data.examCode, data.userCode, data.answers);
});

server.emitter.on('close', async (connection, hadError) => {
    const u = await user.getUserByDesktop(connection);
    user.signOut(u.userCode);
});

server.listen(settings.net.desktop.port);

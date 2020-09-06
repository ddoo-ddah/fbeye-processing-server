const net = require('./lib/net');
const protocol = require('./protocol');
const EventEmitter = require('events');
const exam = require('./exam');
const user = require('./user');
const settings = require('./settings');

const server = new net.Server();
const emitter = new EventEmitter();

server.name = 'desktop';

server.emitter.on('data', (connection, data) => {
    const obj = protocol.toObject(data);
    emitter.emit(obj.type, connection, obj, data);
});

emitter.on('REQ', async (connection, data) => {
    const u = await user.getUserByDesktop(connection);
    if (u.mobile) {
        u.mobile.write(protocol.toBuffer({
            type: 'REQ',
            data
        }));
    }

    if (data === 'startExam') { // 시험 시작하면
        u.accessLog.startTime = new Date();
        const key = exam.envelope.get(u.userCode);
        if (key) { // 문제 복호화 키 전송
            connection.write(protocol.toBuffer({
                type: 'KEY',
                data: key
            }));
        }
    } else if (data === 'endExam') { // 시험 끝나면
        u.accessLog.endTime = new Date();
    }
});

emitter.on('SIN', async (connection, data) => {
    const result = await user.signIn(data.examCode, data.userCode);
    if (result) {
        connection.write(protocol.toBuffer(protocol.signOk));
        const u = await user.getUserByCode(data.userCode);
        u.desktop = connection;

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

        const questions = await exam.encryptQuestions(await exam.getQuestions(data.examCode), data.userCode); // 시험 문제
        connection.write(protocol.toBuffer({
            type: 'QUE',
            data: questions
        }));
    } else {
        connection.write(protocol.toBuffer(protocol.signFailed));
    }
});

emitter.on('DET', (connection, data) => {
    const u = await user.getUserByDesktop(connection);
    u.detected.push(data);
});

emitter.on('ANS', (connection, data) => {
    exam.submitAnswers(data.examCode, data.userCode, data.answers);
});

server.emitter.on('close', async (connection, hadError) => {
    const u = await user.getUserByDesktop(connection);
    user.signOut(u.userCode);
});

server.listen(settings.net.desktop.port);

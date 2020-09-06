const net = require('./lib/net');
const protocol = require('./protocol');
const EventEmitter = require('events');
const user = require('./user');
const settings = require('./settings');

const server = new net.Server();
const emitter = new EventEmitter();

server.name = 'mobile';

server.emitter.on('data', (connection, data) => {
    const obj = protocol.toObject(data);
    emitter.emit(obj.type, connection, obj.data);
});

emitter.on('AUT', async (connection, data) => {
    const result = await user.verifyAuthCode(data.examCode, data.userCode, data.authCode);
    const u = await user.getUserByCode(data.userCode);
    if (result) {
        const authOk = protocol.toBuffer(protocol.authOk);
        if (connection === u.mobile) {
            if (u.desktop) {
                u.desktop.write(authOk);
            }
            if (u.mobile) {
                u.mobile.write(authOk);
            }
        } else if (!u.mobile) {
            u.mobile = connection;
            if (u.desktop) {
                u.desktop.write(protocol.toBuffer(protocol.mobileOk));
                connection.write(protocol.toBuffer(protocol.desktopOk));
            }
        }
    } else {
        const authFailed = protocol.toBuffer(protocol.authFailed);
        if (u.desktop) {
            u.desktop.write(authFailed);
        }
        if (u.mobile) {
            u.mobile.write(authFailed);
        }
    }
});

emitter.on('EYE', async (connection, data) => {
    const u = await user.getUserByMobile(connection);
    if (u.desktop) {
        u.desktop.write(protocol.toBuffer({
            type: 'EYE',
            data
        }));
    }
});

server.listen(settings.net.mobile.port);

const net = require('./lib/net');
const protocol = require('./protocol');
const user = require('./user');
const settings = require('./settings');

const server = new net.Server();
const process = new Map();

server.name = 'mobile';

server.emitter.on('data', (connection, data) => {
    const obj = protocol.toObject(data);
    const func = process.get(obj.type);;
    if (typeof func === 'function') {
        func(connection, obj.data);
    }
});

process.set('AUT', async (connection, data) => {
    const result = await user.verifyAuthCode(data.examCode, data.userCode, data.authCode);
    const u = await user.getUserByCode(data.userCode);
    if (result) {
        const authOk = protocol.toBuffer({
            type: 'RES',
            data: 'authOk'
        });
        if (connection === u.mobile) {
            if (u.desktop) {
                desktop.write(authOk);
            }
            if (u.mobile) {
                mobile.write(authOk);
            }
        } else if (!u.mobile) {
            u.mobile = connection;
            if (u.desktop) {
                u.desktop.write(protocol.toBuffer({
                    type: 'RES',
                    data: 'mobileOk'
                }));
                connection.write(protocol.toBuffer({
                    type: 'RES',
                    data: 'desktopOk'
                }));
            }
        }
    } else {
        const authFailed = protocol.toBuffer({
            type: 'RES',
            data: 'authFailed'
        });
        if (u.desktop) {
            desktop.write(authFailed);
        }
        if (u.mobile) {
            mobile.write(authFailed);
        }
    }
});

server.listen(settings.net.mobile.port);

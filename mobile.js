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
    const desktop = await user.getDesktop(data.examCode, data.userCode);
    const mobile = await user.getMobile(data.examCode, data.userCode);
    if (result) {
        const authOk = protocol.toBuffer({
            type: 'RES',
            data: 'authOk'
        });
        if (connection === mobile) {
            if (desktop) {
                desktop.write(authOk);
            }
            if (mobile) {
                mobile.write(authOk);
            }
        } else if (!mobile) {
            user.setMobile(data.examCode, data.userCode, connection);
            if (desktop) {
                desktop.write(protocol.toBuffer({
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
        if (desktop) {
            desktop.write(authFailed);
        }
        if (mobile) {
            mobile.write(authFailed);
        }
    }
});

server.listen(settings.net.mobile.port);

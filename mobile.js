const net = require('./lib/net');
const protocol = require('./protocol');
const user = require('./user');
const settings = require('./settings');

const server = new net.Server();
const process = new Map();

server.emitter.on('data', (connection, data) => {
    const obj = protocol.toObject(data);
    const func = process.get(obj.type);;
    if (typeof func === 'function') {
        func(connection, obj.data)
    }
});

process.set('AUT', async (connection, data) => {
    const result = await user.verifyAuthCode(data.examCode, data.userCode, data.authCode);
    if (result) {
        const mobile = await user.getMobile(data.examCode, data.userCode);
        if (connection === mobile) {
            const desktop = await user.getDesktop(data.examCode, data.userCode);
            desktop.write(protocol.toBuffer({
                type: 'RES',
                data: 'authOk'
            }));
        } else if (!mobile) {
            user.setMobile(data.examCode, data.userCode, connection);
        }
    }
});

server.listen(settings.net.mobile.port);

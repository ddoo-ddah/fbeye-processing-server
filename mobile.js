const net = require('./lib/net');
const protocol = require('./protocol');
const user = require('./user');
const settings = require('./settings');

const server = new net.Server();
const process = new Map();

server.emitter.on('data', (connection, data) => {
    const obj = protocol.toObject(data);
    process.get(obj.type)(connection, obj.data);
});

process.set('aut', async (connection, data) => {
    const result = await user.verifyAuthCode(data.exam, data.user, data.authCode);
    if (result) {
        const mobile = await user.getMobile(data.exam, data.user);
        if (connection === mobile) {
            const desktop = await user.getDesktop(data.exam, data.user);
            desktop.socket.write(protocol.toBuffer({
                type: 'res',
                data: 'authOk'
            }));
        } else if (!mobile) {
            user.setMobile(data.exam, data.user, connection);
        }
    }
});

server.listen(settings.settings.net.mobile.port);

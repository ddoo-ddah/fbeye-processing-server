const net = require('./lib/net');
const protocol = require('./protocol');
const settings = require('./settings');

const server = new net.Server();

server.emitter.on('data', async (connection, data) => {
    const obj = protocol.toObject(data);
    if (obj.type === 'aut') {
        const result = await user.verifyAuthCode(obj.data.exam, obj.data.user, obj.authCode);
        const desktop = await user.getDesktop(obj.data.exam, obj.data.user);
        if (result) {
            const mobile = await user.getMobile(obj.data.exam, obj.data.user);
            if (connection === mobile) {
                desktop.socket.write(protocol.toBuffer({
                    type: 'res',
                    data: 'authOk'
                }));
            } else if (!mobile) {
                user.setMobile(obj.data.exam, obj.data.user, connection);
            }
        }
    }
});

server.listen(settings.settings.net.mobile.port);

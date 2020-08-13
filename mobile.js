const net = require('./lib/net');
const protocol = require('./protocol');
const sign = require('./sign');
const auth = require('./auth');
const settings = require('./settings');

const server = new net.Server();

server.emitter.on('data', async (connection, data) => {
    const obj = protocol.toObject(data);
    if (obj.type === 'aut') {
        const result = await auth.verify(obj.data.exam, obj.data.user, obj.authCode);
        const desktop = await sign.getDesktop(obj.data.exam, obj.data.user);
        if (result) {
            const mobile = await sign.getMobile(obj.data.exam, obj.data.user);
            if (connection === mobile) {
                desktop.socket.write(protocol.toBuffer({
                    type: 'res',
                    data: 'authOk'
                }));
            } else if (!mobile) {
                sign.setMobile(obj.data.exam, obj.data.user, connection);
            }
        }
    }
});

server.listen(settings.settings.net.mobile.port);

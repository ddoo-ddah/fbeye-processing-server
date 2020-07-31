const net = require('./net');

console.log('FBEye Processing Server');

const serverDesktop = new net.Server(null, null);
const serverMobile = new net.Server(null, null);

serverDesktop.start(10100);
serverMobile.start(10101);

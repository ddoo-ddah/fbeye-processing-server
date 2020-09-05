function toBuffer(obj) {
    return Buffer.from(JSON.stringify(obj));
}

function toObject(buf) {
    return JSON.parse(buf.toString());
}

const ok = {
    type: 'RES',
    data: 'ok'
};

const signOk = {
    type: 'RES',
    data: 'signOk'
};
const signFailed = {
    type: 'RES',
    data: 'signFailed'
};

const authOk = {
    type: 'RES',
    data: 'authOk'
};
const authFailed = {
    type: 'RES',
    data: 'authFailed'
};

const desktopOk = {
    type: 'RES',
    data: 'desktopOk'
};
const mobileOk = {
    type: 'RES',
    data: 'mobileOk'
};

module.exports = {
    toBuffer, toObject, ok, signOk, signFailed, authOk, authFailed, desktopOk, mobileOk
};

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
    toBuffer, toObject, ok, authOk, authFailed, desktopOk, mobileOk
};

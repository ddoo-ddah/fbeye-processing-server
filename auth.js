const crypto = require('crypto');

// 인증 코드의 길이 (Byte 단위)
const size = 48;
// 인증 코드 갱신 주기 (ms 단위)
const interval = 30000;

const authCodes = [];

const update = () => {
    for (let i = 0; i < authCodes.length; i++) {
        crypto.randomBytes(size, (err, buf) => {
            if (err) {
                console.error(err);
            } else {
                authCodes[i].authCode = buf;
            }
        });
    }
};

const verify = (exam, user, authCode, callback) => {
    const found = authCodes.find(e => e.authCode == authCode);
    const result = (found !== undefined) && (found.exam === exam) && (found.user === user);
    if (typeof callback === 'function') {
        callback(exam, user, result);
    }
};

setInterval(update, interval);

module.exports = {
    authCodes, update, verify
};

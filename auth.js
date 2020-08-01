const crypto = require('crypto');
const settings = require('./settings');

const authCodes = [];

const update = () => {
    for (let i = 0; i < authCodes.length; i++) {
        crypto.randomBytes(settings.settings.auth.size, (err, buf) => {
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

setInterval(update, settings.settings.auth.interval);

module.exports = {
    authCodes, update, verify
};

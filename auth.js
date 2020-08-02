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

const verify = (exam, user, authCode) => {
    return new Promise((resolve, reject) => {
        if (exam && user && authCode && authCodes) {
            const found = authCodes.find(e => e.authCode == authCode);
            resolve((found !== undefined) && (found.exam === exam) && (found.user === user));
        } else {
            reject(new Error('Failed to verify the auth code.'));
        }
    });
};

update();
setInterval(update, settings.settings.auth.interval);

module.exports = {
    authCodes, update, verify
};

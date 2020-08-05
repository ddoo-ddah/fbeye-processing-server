const crypto = require('crypto');
const settings = require('./settings');

const authCodes = [];

function update() {
    authCodes.forEach(e => {
        e.users.forEach(f => {
            crypto.randomBytes(settings.settings.auth.size, (err, buf) => {
                if (err) {
                    console.error(err);
                } else {
                    f.authCode = buf;
                }
            });
        });
    });
}

function verify(exam, user, authCode) {
    return new Promise((resolve, reject) => {
        if (exam && user && authCode && authCodes) {
            const found = authCodes.find(e => e.exam === exam).users.find(e => e.user === user);
            resolve((found !== undefined) && (found.authCode === authCodes));
        } else {
            reject(new Error('Failed to verify the auth code.'));
        }
    });
}

update();
setInterval(update, settings.settings.auth.interval);

module.exports = {
    authCodes, update, verify
};

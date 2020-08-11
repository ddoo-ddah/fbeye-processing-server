const crypto = require('crypto');
const util = require('util');
const settings = require('../settings');

const randomBytes = util.promisify(crypto.randomBytes);
const scrypt = util.promisify(crypto.scrypt);

async function encrypt(data, password) {
    const salt = await randomBytes(settings.settings.crypto.length);
    const key = await scrypt(password, salt, settings.settings.crypto.length);
    const cipher = crypto.createCipheriv(settings.settings.crypto.algorithm, key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(data);
    encrypted += cipher.final();
    return new Promise((resolve, reject) => {
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to encrypt data.'));
        }
    });
}

module.exports = {
    randomBytes, scrypt, encrypt
};

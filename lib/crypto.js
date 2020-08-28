const crypto = require('crypto');
const util = require('util');
const settings = require('../settings');

const randomBytes = util.promisify(crypto.randomBytes);
const scrypt = util.promisify(crypto.scrypt);

let salt;
randomBytes(settings.crypto.length).then(buf => {
    salt = buf;
}).catch(err => {
    console.error(err);
});

function createKey(password) {
    return new Promise(async (resolve, reject) => {
        const key = (await scrypt(password, salt, settings.crypto.length)).toString('base64');
        if (key) {
            resolve(key);
        } else {
            reject('Failed to create key.');
        }
    });
}

function encrypt(data, key, encoding) {
    return new Promise((resolve, reject) => {
        const cipher = crypto.createCipheriv(settings.crypto.algorithm, Buffer.from(key, 'base64'), Buffer.alloc(16, 0));
        let encrypted = cipher.update(data, encoding, 'base64');
        encrypted += cipher.final('base64');
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to encrypt data.'));
        }
    });
}

function decrypt(encrypted, key, encoding) {
    return new Promise((resolve, reject) => {
        const decipher = crypto.createDecipheriv(settings.crypto.algorithm, Buffer.from(key, 'base64'), Buffer.alloc(16, 0));
        let decrypted = decipher.update(encrypted, 'base64', encoding);
        decrypted += decipher.final(encoding);
        if (decrypted) {
            resolve(decrypted);
        } else {
            reject(new Error('Failed to decrypt data.'));
        }
    });
}

module.exports = {
    randomBytes, scrypt, createKey, encrypt, decrypt
};

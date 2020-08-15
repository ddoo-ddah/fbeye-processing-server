const crypto = require('crypto');
const util = require('util');
const settings = require('../settings');

const randomBytes = util.promisify(crypto.randomBytes);
const scrypt = util.promisify(crypto.scrypt);

let salt;
randomBytes(settings.settings.crypto.length).then(buf => {
    salt = buf;
}).catch(err => {
    console.error(err);
});

async function createKey(password) {
    const key = await scrypt(password, salt, settings.settings.crypto.length);
    return new Promise((resolve, reject) => {
        if (key) {
            resolve(key);
        } else {
            reject('Failed to create key.');
        }
    });
}

async function encrypt(data, password, encoding) {
    const key = await createKey(password);
    const cipher = crypto.createCipheriv(settings.settings.crypto.algorithm, key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(data, encoding, 'binary');
    encrypted += cipher.final('binary');
    return new Promise((resolve, reject) => {
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to encrypt data.'));
        }
    });
}

async function decrypt(encrypted, password, encoding) {
    const key = await createKey(password);
    const decipher = crypto.createDecipheriv(settings.settings.crypto.algorithm, key, Buffer.alloc(16, 0));
    let decrypted = decipher.update(encrypted, 'binary', encoding);
    decrypted += decipher.final(encoding);
    return new Promise((resolve, reject) => {
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

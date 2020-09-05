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
        try {
            const key = (await scrypt(password, salt, settings.crypto.length)).toString('base64');
            resolve(key);
        } catch (err) {
            reject(err);
        }
    });
}

function encrypt(data, key, encoding) {
    return new Promise((resolve, reject) => {
        try {
            const cipher = crypto.createCipheriv(settings.crypto.algorithm, Buffer.from(key, 'base64'), Buffer.alloc(16, 0));
            let encrypted = cipher.update(data, encoding, 'base64');
            encrypted += cipher.final('base64');
            resolve(encrypted);
        } catch (err) {
            reject(err);
        }
    });
}

function decrypt(encrypted, key, encoding) {
    return new Promise((resolve, reject) => {
        try {
            const decipher = crypto.createDecipheriv(settings.crypto.algorithm, Buffer.from(key, 'base64'), Buffer.alloc(16, 0));
            let decrypted = decipher.update(encrypted, 'base64', encoding);
            decrypted += decipher.final(encoding);
            resolve(decrypted);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    randomBytes, scrypt, createKey, encrypt, decrypt
};

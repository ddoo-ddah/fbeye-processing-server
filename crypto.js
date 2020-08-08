const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes);
const scrypt = util.promisify(crypto.scrypt);

async function encrypt(data, password) {
    const salt = await randomBytes(32);
    const key = await scrypt(password, salt, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
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

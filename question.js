const db = require('./lib/db');
const crypto = require('./lib/crypto');
const settings = require('./settings');

async function getQuestions(exam) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: exam
    });
    await client.close();
    const questions = doc.questions;
    return new Promise((resolve, reject) => {
        if (questions) {
            resolve(questions);
        } else {
            reject(new Error('Failed to get questions.'));
        }
    });
}

const envelope = new Map();

async function encryptQuestions(questions) {
    const password = await crypto.randomBytes(settings.settings.crypto.length);
    const key = await crypto.createKey(password);
    const encrypted = await crypto.encrypt(JSON.stringify(questions), key, 'utf8');
    envelope.set(encrypted, key);
    return new Promise((resolve, reject) => {
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to encrypt questions.'));
        }
    });
}

async function decryptQuestions(encrypted) {
    const key = envelope.get(encrypted);
    const decrypted = await crypto.decrypt(encrypted, key, 'utf8');
    const questions = JSON.parse(decrypted);
    return new Promise((resolve, reject) => {
        if (questions) {
            resolve(questions);
        } else {
            reject(new Error('Failed to decrypt questions.'));
        }
    });
}

async function getEncryptedQuestions(exam) {
    const questions = await getQuestions(exam);
    const encrypted = await encryptQuestions(questions);
    return new Promise((resolve, reject) => {
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to get encrypted questions.'));
        }
    });
}

module.exports = {
    getQuestions, encryptQuestions, decryptQuestions, envelope, getEncryptedQuestions
};

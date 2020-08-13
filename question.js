const db = require('./lib/db');
const crypto = require('./lib/crypto');
const settings = require('./settings');

async function getQuestions(exam) {
    const client = await db.getClient();
    const doc = await client.db().findOne({
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
    const encrypted = await crypto.encrypt(JSON.stringify(questions), password);
    envelope.set(encrypted, password);
    return new Promise((resolve, reject) => {
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to encrypt questions.'));
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
    envelope, getEncryptedQuestions
};

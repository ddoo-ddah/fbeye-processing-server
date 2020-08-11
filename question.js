const db = require('./lib/db');
const crypto = require('./lib/crypto');
const settings = require('./settings');

const exams = [];

async function loadQuestions(examCode) {
    const client = await db.getClient();
    const doc = await client.db().findOne({
        accessCode: examCode
    });
    return new Promise((resolve, reject) => {
        if (doc) {
            resolve({
                examCode,
                questions: doc.questions
            });
        } else {
            reject(new Error('Failed to load questions.'));
        }
    });
}

async function encryptQuestions(exam) {
    const password = await crypto.randomBytes(settings.settings.crypto.length);
    const encrypted = await crypto.encrypt(exam.questions, password);
    return new Promise((resolve, reject) => {
        if (encrypted) {
            resolve({
                examCode: exam.examCode,
                questions: exam.questions,
                password
            });
        } else {
            reject(new Error('Failed to encrypt questions.'));
        }
    });
}

async function getQuestions(examCode) {
    let found = exams.find(e => e.examCode === examCode);
    if (!found) {
        const loaded = await loadQuestions(examCode);
        const encrypted = await encryptQuestions(loaded);
        exams.push(encrypted);
        found = encrypted;
    }
    return new Promise((resolve, reject) => {
        if (found) {
            resolve(found);
        } else {
            reject(new Error('Failed to get questions.'));
        }
    });
}

module.exports = {
    getQuestions
};

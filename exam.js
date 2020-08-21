const db = require('./lib/db');
const crypto = require('./lib/crypto');
const settings = require('./settings');

async function getExamInformation(examCode) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: examCode
    }, {
        _id: false,
        accessCode: true,
        title: true,
        startTime: true,
        endTime: true
    });
    await client.close();
    return new Promise((resolve, reject) => {
        if (doc) {
            resolve(doc);
        } else {
            reject(new Error('Failed to get exam information.'));
        }
    });
}

async function getQuestions(examCode) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: examCode
    }, {
        _id: false,
        questions: true
    });
    await client.close();

    const questions = [];
    doc.questions.forEach(e => { // 정답 제외
        questions.push({
            type,
            question,
            score
        } = e);
    });

    return new Promise((resolve, reject) => {
        if (doc) {
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

async function submitAnswers(exam, user, answers) { // 답변 제출
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: exam,
        users: {
            $elemMatch: {
                accessCode: user
            }
        }
    });
    const found = doc.users.find(e => e.accessCode === user);
    found.answers = answers;
    await client.db().collection('exams').updateOne({
        accessCode: exam,
        users: {
            $elemMatch: {
                accessCode: user
            }
        }
    }, {
        $set: {
            users: doc.users
        }
    });
    await client.close();
}

module.exports = {
    getExamInformation, getQuestions, envelope, encryptQuestions, decryptQuestions, getEncryptedQuestions, submitAnswers
};

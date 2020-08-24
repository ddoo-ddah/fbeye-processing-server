const db = require('./lib/db');
const crypto = require('./lib/crypto');
const settings = require('./settings');

function getExamInformation(examCode) {
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
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
        if (doc) {
            resolve(doc);
        } else {
            reject(new Error('Failed to get exam information.'));
        }
    });
}

function getQuestions(examCode) {
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
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

        if (doc) {
            resolve(questions);
        } else {
            reject(new Error('Failed to get questions.'));
        }
    });
}

const envelope = new Map();

function encryptQuestions(questions) {
    return new Promise(async (resolve, reject) => {
        const password = await crypto.randomBytes(settings.settings.crypto.length);
        const key = await crypto.createKey(password);
        const encrypted = await crypto.encrypt(JSON.stringify(questions), key, 'utf8');
        envelope.set(encrypted, key);
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to encrypt questions.'));
        }
    });
}

function decryptQuestions(encrypted) {
    return new Promise(async (resolve, reject) => {
        const key = envelope.get(encrypted);
        const decrypted = await crypto.decrypt(encrypted, key, 'utf8');
        const questions = JSON.parse(decrypted);
        if (questions) {
            resolve(questions);
        } else {
            reject(new Error('Failed to decrypt questions.'));
        }
    });
}

function getEncryptedQuestions(exam) {
    return new Promise(async (resolve, reject) => {
        const questions = await getQuestions(exam);
        const encrypted = await encryptQuestions(questions);
        if (encrypted) {
            resolve(encrypted);
        } else {
            reject(new Error('Failed to get encrypted questions.'));
        }
    });
}

async function submitAnswers(examCode, userCode, answers) { // 답변 제출
    const client = await db.connect();
    const doc = await client.db().collection('exams').findOne({
        accessCode: examCode
    });
    await client.db().collection('users').updateOne({
        _id: {
            $in: doc.users
        },
        accessCode: userCode
    }, {
        $set: {
            answers
        }
    });
    await client.close();
}

module.exports = {
    getExamInformation, getQuestions, envelope, encryptQuestions, decryptQuestions, getEncryptedQuestions, submitAnswers
};

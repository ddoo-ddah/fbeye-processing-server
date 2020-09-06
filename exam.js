const db = require('./lib/db');
const crypto = require('./lib/crypto');
const settings = require('./settings');

function getExamInformation(examCode) {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await db.connect();
            const doc = await client.db().collection('exams').findOne({
                accessCode: examCode
            }, {
                projection: {
                    _id: false,
                    accessCode: true,
                    title: true,
                    startTime: true,
                    endTime: true,
                    questions: true
                }
            });
            await client.close();

            doc.count = doc.questions ? doc.questions.length : 0; // 문제 수
            if (doc.questions) {
                doc.questions = undefined;
            }

            resolve(doc);
        } catch (err) {
            reject(err);
        }
    });
}

function getQuestions(examCode) {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await db.connect();
            const doc = await client.db().collection('exams').findOne({
                accessCode: examCode
            }, {
                projection: {
                    _id: false,
                    questions: true
                }
            });
            await client.close();

            doc.questions.forEach(e => { // 정답 제외
                if (e.answers) { // 주관식
                    e.answers = undefined;
                }
                if (e.multipleChoices) { // 객관식
                    e.multipleChoices.forEach(f => {
                        f.answers = undefined;
                    });
                }
            });

            resolve(doc.questions);
        } catch (err) {
            reject(err);
        }
    });
}

const envelope = new Map();

function encryptQuestions(questions, userCode) {
    return new Promise(async (resolve, reject) => {
        try {
            const password = await crypto.randomBytes(settings.crypto.length);
            const key = await crypto.createKey(password);
            const encrypted = await crypto.encrypt(JSON.stringify(questions), key, 'utf8');
            envelope.set(userCode, key);

            resolve(encrypted);
        } catch (err) {
            reject(err);
        }
    });
}

function decryptQuestions(encrypted, userCode) {
    return new Promise(async (resolve, reject) => {
        try {
            const key = envelope.get(userCode);
            const decrypted = await crypto.decrypt(encrypted, key, 'utf8');
            const questions = JSON.parse(decrypted);

            resolve(questions);
        } catch (err) {
            reject(err);
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
    getExamInformation, getQuestions, envelope, encryptQuestions, decryptQuestions, submitAnswers
};

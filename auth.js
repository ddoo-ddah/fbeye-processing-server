const crypto = require('./lib/crypto');
const db = require('./lib/db');
const settings = require('./settings');

let authCodes = [];

async function load() {
    const client = await db.getClient();
    const cursor = client.db().collection('exams').find();
    const arr = [];
    await cursor.forEach(doc => {
        const exam = {
            exam: doc.accessCode,
            users: []
        };
        doc.users.forEach(e => {
            exam.users.push({
                user: e.accessCode,
                authCode: null
            });
        });
        arr.push(exam);
    });
    authCodes = arr;
    await client.close();
    update();
}

function update() {
    authCodes.forEach(e => {
        e.users.forEach(async f => {
            f.authCode = await crypto.randomBytes(settings.settings.auth.size);
        });
    });
}

function verify(exam, user, authCode) {
    return new Promise((resolve, reject) => {
        if (exam && user && authCode && authCodes) {
            const found = authCodes.find(e => e.exam === exam).users.find(e => e.user === user);
            resolve((found !== undefined) && (found.authCode === authCodes));
        } else {
            reject(new Error('Failed to verify the auth code.'));
        }
    });
}

function getAuthCode(exam, user) {
    const found = authCodes.find(e => e.exam === exam).users.find(e => e.user === user);
    return new Promise((resolve, reject) => {
        if (found) {
            resolve(found.authCode);
        } else {
            reject(new Error('Failed to get the auth code.'));
        }
    });
}

load();
setInterval(load, settings.settings.auth.interval);

module.exports = {
    load, update, verify, getAuthCode
};

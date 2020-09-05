const db = require('./lib/db');
const crypto = require('./lib/crypto');
const protocol = require('./protocol');
const settings = require('./settings');

function getUserInformation(userCode) {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await db.connect();
            const doc = await client.db().collection('users').findOne({
                accessCode: userCode
            }, {
                projection: {
                    _id: false,
                    email: true,
                    name: true,
                    accessCode: true
                }
            });
            await client.close();

            resolve(doc);
        } catch (err) {
            reject(err);
        }
    });
}

const users = [];

function signIn(examCode, userCode) {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await db.connect();
            const doc1 = await client.db().collection('exams').findOne({
                accessCode: examCode
            });
            const doc2 = await client.db().collection('users').findOne({
                _id: {
                    $in: doc1.users
                },
                accessCode: userCode
            }, {
                projection: {
                    _id: false,
                    email: true,
                    name: true
                }
            });
            await client.close();

            if (doc2) {
                doc2.examCode = examCode;
                doc2.userCode = userCode;
                doc2.accessTime = new Date();
                users.push(doc2);
                updateAuthCode();
            }

            console.log(`${examCode} ${userCode} signed in. ${doc2.accessTime}`);
            resolve(true);
        } catch (err) {
            console.error(err);
            resolve(false);
        }
    });
}

function signOut(userCode) {
    const found = users.find(e => e.userCode === userCode);
    users.remove(found);
}

function getUserByCode(userCode) {
    return new Promise((resolve, reject) => {
        const found = users.find(e => e.userCode === userCode);
        if (found) {
            resolve(found);
        } else {
            reject(new Error('Failed to get user by code.'));
        }
    });
}

function getUserByDesktop(desktop) {
    return new Promise((resolve, reject) => {
        const found = users.find(e => e.desktop === desktop);
        if (found) {
            resolve(found);
        } else {
            reject(new Error('Failed to get user by desktop.'));
        }
    });
}

function getUserByMobile(mobile) {
    return new Promise((resolve, reject) => {
        const found = users.find(e => e.mobile === mobile);
        if (found) {
            resolve(found);
        } else {
            reject(new Error('Failed to get user by mobile.'));
        }
    });
}

function updateAuthCode() { // 인증 코드 갱신
    users.forEach(async e => {
        e.authCode = (await crypto.randomBytes(settings.auth.size)).toString('base64');

        if (e.desktop) { // 갱신된 인증 코드 전송
            e.desktop.write(protocol.toBuffer({
                type: 'AUT',
                data: {
                    examCode: e.examCode,
                    userCode: e.userCode,
                    authCode: e.authCode
                }
            }));
        }
    });
}

function verifyAuthCode(examCode, userCode, authCode) {
    return new Promise((resolve, reject) => {
        const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
        resolve(found && found.authCode && (authCode === found.authCode));
    });
}

function getAuthCode(examCode, userCode) {
    return new Promise((resolve, reject) => {
        const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
        if (found && found.authCode) {
            resolve(found.authCode);
        } else {
            reject(new Error('Failed to get the auth code.'));
        }
    });
}

setInterval(updateAuthCode, settings.auth.interval);

module.exports = {
    getUserInformation, signIn, signOut, getUserByCode, getUserByDesktop, getUserByMobile, updateAuthCode, verifyAuthCode, getAuthCode
};

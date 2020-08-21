const db = require('./lib/db');
const array = require('./lib/array');
const crypto = require('./lib/crypto');
const protocol = require('./protocol');
const settings = require('./settings');

async function getUserInformation(exam, user) {
    const client = await db.getClient();
    const doc = await client.db().collection('users').findOne({
        accessCode: userCode
    }, {
        _id: false,
        email: true,
        name: true,
        accessCode: true
    });
    await client.close();
    return new Promise((resolve, reject) => {
        if (doc) {
            resolve(doc);
        } else {
            reject(new Error('Failed to get user information.'));
        }
    });
}

const users = [];

async function signIn(examCode, userCode) {
    const client = await db.getClient();
    const doc1 = await client.db().collection('exams').findOne({
        accessCode: examCode
    });
    const doc2 = await client.db().collection('users').findOne({
        _id: {
            $in: doc1.users
        },
        accessCode: userCode
    }, {
        _id: false,
        email: true,
        name: true
    });
    await client.close();

    if (doc2) {
        doc2.examCode = examCode;
        doc2.userCode = userCode;
        users.push(doc2);
        updateAuthCode();
    }

    return new Promise((resolve, reject) => {
        if (users.find(e => e.userCode === userCode)) {
            resolve(doc1 && doc2);
        } else {
            reject(new Error('Sign in failed.'));
        }
    });
}

function signOut(examCode, userCode) {
    const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
    array.remove(users, found);
}

function getDesktop(examCode, userCode) {
    const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
    return new Promise((resolve, reject) => {
        if (found && found.desktop) {
            resolve(found.desktop);
        } else {
            reject(new Error('Failed to get user information.'));
        }
    });
}

function setDesktop(examCode, userCode, connection) {
    const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
    if (found) {
        found.desktop = connection;
    }
}

function getMobile(examCode, userCode) {
    const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
    return new Promise((resolve, reject) => {
        if (found && found.mobile) {
            resolve(found.mobile);
        } else {
            reject(new Error('Failed to get user information.'));
        }
    });
}

function setMobile(examCode, userCode, connection) {
    const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
    if (found) {
        found.mobile = connection;
    }
}

function updateAuthCode() { // 인증 코드 갱신
    users.forEach(async e => {
        e.authCode = await crypto.randomBytes(settings.settings.auth.size);

        if (e.desktop) { // 갱신된 인증 코드 전송
            e.desktop.socket.write(protocol.toBuffer({
                type: 'aut',
                data: {
                    examCode,
                    userCode,
                    authCode
                } = e
            }));
        }
    });
}

function verifyAuthCode(exam, user, authCode) {
    const found = users.find(e => e.accessCode === exam).users.find(e => e.accessCode === user);
    return new Promise((resolve, reject) => {
        if (found) {
            resolve(found.authCode === authCode);
        } else {
            reject(new Error('Failed to verify the auth code.'));
        }
    });
}

function getAuthCode(exam, user) {
    const found = users.find(e => e.accessCode === exam).users.find(e => e.accessCode === user);
    return new Promise((resolve, reject) => {
        if (found) {
            resolve(found.authCode);
        } else {
            reject(new Error('Failed to get the auth code.'));
        }
    });
}

setInterval(updateAuthCode, settings.settings.auth.interval);

module.exports = {
    getUserInformation, signIn, signOut, getDesktop, setDesktop, getMobile, setMobile, updateAuthCode, verifyAuthCode, getAuthCode
};

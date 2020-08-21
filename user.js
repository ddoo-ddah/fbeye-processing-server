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

function getDesktop(exam, user) {
    const found = users.find(e => e.accessCode === exam).users.find(e => e.accessCode === user);
    return new Promise((resolve, reject) => {
        if (found) {
            resolve(found.desktop);
        } else {
            reject(new Error('Failed to get user information.'));
        }
    });
}

function setDesktop(exam, user, connection) {
    const found = users.find(e => e.accessCode === exam).users.find(e => e.accessCode === user);
    if (found) {
        found.desktop = connection;
    }
}

function getMobile(exam, user) {
    const found = users.find(e => e.accessCode === exam).user.find(e => e.accessCode === user);
    return new Promise((resolve, reject) => {
        if (found) {
            resolve(found.mobile);
        } else {
            reject(new Error('Failed to get user information.'));
        }
    });
}

function setMobile(exam, user, connection) {
    const found = users.find(e => e.accessCode === exam).users.find(e => e.accessCode == user);
    if (found) {
        found.mobile = connection;
    }
}

function updateAuthCode() {
    users.forEach(e => {
        e.users.forEach(async f => {
            f.authCode = await crypto.randomBytes(settings.settings.auth.size);
            if (f.desktop) { // 갱신된 인증 코드 전송
                f.desktop.socket.write(protocol.toBuffer({
                    type: 'aut',
                    data: {
                        exam: e.accessCode,
                        user: f.accessCode,
                        authCode: f.accessCode
                    }
                }));
            }
        });
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

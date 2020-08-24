const db = require('./lib/db');
const crypto = require('./lib/crypto');
const protocol = require('./protocol');
const settings = require('./settings');

function getUserInformation(userCode) {
    return new Promise(async (resolve, reject) => {
        const client = await db.connect();
        const doc = await client.db().collection('users').findOne({
            accessCode: userCode
        }, {
            _id: false,
            email: true,
            name: true,
            accessCode: true
        });
        await client.close();
        if (doc) {
            resolve(doc);
        } else {
            reject(new Error('Failed to get user information.'));
        }
    });
}

const users = [];

function signIn(examCode, userCode) {
    return new Promise(async (resolve, reject) => {
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

        if (users.find(e => e.userCode === userCode)) {
            resolve(doc1 && doc2);
        } else {
            reject(new Error('Sign in failed.'));
        }
    });
}

function signOut(examCode, userCode) {
    const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
    users.remove(found);
}

function getDesktop(examCode, userCode) {
    return new Promise((resolve, reject) => {
        const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
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
    return new Promise((resolve, reject) => {
        const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
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

function verifyAuthCode(examCode, userCode, authCode) {
    return new Promise((resolve, reject) => {
        const found = users.find(e => (e.examCode === examCode) && (e.userCode === userCode));
        if (found && found.authCode) {
            resolve(authCode.compare(found.authCode) === 0);
        } else {
            reject(new Error('Failed to verify the auth code.'));
        }
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

setInterval(updateAuthCode, settings.settings.auth.interval);

module.exports = {
    getUserInformation, signIn, signOut, getDesktop, setDesktop, getMobile, setMobile, updateAuthCode, verifyAuthCode, getAuthCode
};

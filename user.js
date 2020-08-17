const db = require('./lib/db');
const array = require('./lib/array');

async function getUserInformation(exam, user) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: exam
    });
    await client.close();
    const {
        email,
        accessCode,
        name
    } = doc.users.find(e => e.accessCode === user);
    return new Promise((resolve, reject) => {
        if (doc) {
            resolve({
                email,
                accessCode,
                name
            });
        } else {
            reject(new Error('Failed to get user information.'));
        }
    });
}

const users = [];

async function signIn(exam, user) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: exam
    });
    await client.close();
    const {
        email,
        accessCode,
        name
    } = doc.users.find(e => e.accessCode === user);
    const u = {
        email,
        accessCode,
        name
    };
    const result = u.accessCode === user;
    if (result) {
        const found = users.find(e => e.accessCode === exam);
        if (found) {
            found.users.push(u);
        } else {
            users.push({
                accessCode: exam,
                users: [
                    u
                ]
            });
        }
    }
    return new Promise((resolve, reject) => {
        if (doc) {
            resolve(result);
        } else {
            reject(new Error('Sign in failed.'));
        }
    });
}

function signOut(exam, user) {
    const found1 = users.find(e => e.accessCode === exam).users;
    if (found1) {
        const found2 = found1.find(e => e.accessCode === user);
        if (found2) {
            array.remove(found1, found2);
        }
    }
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

module.exports = {
    getUserInformation, signIn, signOut, getDesktop, setDesktop, getMobile, setMobile
};

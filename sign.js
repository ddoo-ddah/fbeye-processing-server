const db = require('./lib/db');

const users = [];

async function signIn(exam, user) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: exam,
        users: {
            accessCode: user
        }
    });
    await client.close();
    return new Promise((resolve, reject) => {
        if (doc) {
            resolve((doc.accessCode === exam) && (doc.users.find(e => e.accessCode === user)));
        } else {
            reject(new Error('Sign in failed.'));
        }
    });
}

function setDesktop(exam, user, connection) {
    const found = users.find(e => e.exam === exam).users.find(e => e.user === user);
    if (found) {
        found.desktop = connection;
    }
}

function setMobile(exam, user, connection) {
    const found = users.find(e => e.exam === exam).users.find(e => e.user == user);
    if (found) {
        found.mobile = connection;
    }
}

module.exports = {
    signIn, setDesktop, setMobile
};

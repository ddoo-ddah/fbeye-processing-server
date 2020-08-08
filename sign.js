const db = require('./db');

async function signIn(exam, user) {
    const client = await db.crud();
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

module.exports = {
    signIn
};

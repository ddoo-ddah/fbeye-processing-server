const db = require('./lib/db');

async function getUserInformation(exam, user) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: exam
    });
    await client.close();
    const found = doc.users.find(e => e.accessCode === user);
    const {
        email,
        accessCode,
        name
    } = found;
    return new Promise((resolve, reject) => {
        if (found) {
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

module.exports = {
    getUserInformation
};

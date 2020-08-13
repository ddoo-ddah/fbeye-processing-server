const db = require('./lib/db');

async function submit(exam, user, answers) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: exam
    });
    const found = doc.users.find(e => e.accessCode === user);
    found.answers = answers;
    await client.db().collection('exams').replaceOne({
        accessCode: exam
    }, doc);
    await client.close();
}

module.exports = {
    submit
};

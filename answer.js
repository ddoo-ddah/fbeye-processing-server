const db = require('./lib/db');

async function submit(exam, user, answers) {
    const client = await db.getClient();
    await client.db().collection('exams').updateOne({
        accessCode: exam,
        users: {
            accessCode: user
        }
    }, {
        $set: {
            users: {
                answers
            }
        }
    });
    await client.close();
}

module.exports = {
    submit
};

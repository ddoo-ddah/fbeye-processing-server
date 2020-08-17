const db = require('./lib/db');

async function getExamInformation(exam) {
    const client = await db.getClient();
    const doc = await client.db().collection('exams').findOne({
        accessCode: exam
    });
    await client.close();
    const {
        accessCode,
        title,
        startTime,
        endTime
    } = doc;
    return new Promise((resolve, reject) => {
        if (doc) {
            resolve({
                accessCode,
                title,
                startTime,
                endTime
            });
        } else {
            reject(new Error('Failed to get exam information.'));
        }
    });
}

module.exports = {
    getExamInformation
};

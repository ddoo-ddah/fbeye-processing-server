const db = require('./db');

const exams = [];

async function loadQuestions(exam) {
    const client = await db.crud();
    const doc = await client.db().findOne({
        accessCode: exam
    });
    return new Promise((resolve, reject) => {
        if (doc) {
            resolve({
                exam,
                questions: doc.questions
            });
        } else {
            reject(new Error('Failed to load questions.'));
        }
    });
}

async function getQuestions(exam) {
    let found = exams.find(e => e.exam === exam);
    if (!found) {
        found = await loadQuestions(exam);
        exams.push(found);
    }
    return new Promise((resolve, reject) => {
        if (found) {
            resolve(found);
        } else {
            reject(new Error('Failed to get questions.'));
        }
    });
}

module.exports = {
    getQuestions
};

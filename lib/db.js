const mongodb = require('mongodb');
const settings = require('../settings');

async function crud() {
    const mongoClient = await mongodb.MongoClient.connect(settings.settings.db.uri);
    return new Promise((resolve, reject) => {
        if (mongoClient) {
            resolve(mongoClient);
        } else {
            reject(new Error('Could not connect to the database.'));
        }
    });
};

module.exports = {
    crud
};

const mongodb = require('mongodb');
const settings = require('../settings');

const objectId = mongodb.ObjectId;
const timestamp = mongodb.Timestamp;

function connect() {
    return new Promise(async (resolve, reject) => {
        const mongoClient = await mongodb.MongoClient.connect(settings.settings.db.uri);
        if (mongoClient) {
            resolve(mongoClient);
        } else {
            reject(new Error('Could not connect to the database.'));
        }
    });
};

module.exports = {
    objectId, timestamp, connect
};

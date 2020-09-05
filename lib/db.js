const mongodb = require('mongodb');
const settings = require('../settings');

const objectId = mongodb.ObjectId;
const timestamp = mongodb.Timestamp;

function connect() {
    return new Promise(async (resolve, reject) => {
        try {
            const mongoClient = await mongodb.MongoClient.connect(settings.db.uri);
            resolve(mongoClient);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    objectId, timestamp, connect
};

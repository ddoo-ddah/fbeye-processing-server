const mongodb = require('mongodb');
const settings = require('./settings');

const crud = callback => {
    mongodb.MongoClient.connect(settings.settings.db.uri, (err, client) => {
        if (err) {
            console.error(err);
        } else if (typeof callback === 'function') {
            callback(client);
        }
    });
};

module.exports = {
    crud
};

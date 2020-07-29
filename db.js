const mongodb = require('mongodb');

// MongoDB 연결 URI
const uri = 'mongodb://localhost:27017/fbeye';

const crud = callback => {
    mongodb.MongoClient.connect(uri, (err, client) => {
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

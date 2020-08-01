const fs = require('fs');

const settings = JSON.parse(fs.readFileSync('./settings.json'));

module.exports = {
    settings
};

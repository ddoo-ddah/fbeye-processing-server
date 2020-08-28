const fs = require('fs');

const settings = JSON.parse(fs.readFileSync('./settings.json'));

settings.net.key = fs.readFileSync(settings.net.key);
settings.net.cert = fs.readFileSync(settings.net.cert);

module.exports = settings;

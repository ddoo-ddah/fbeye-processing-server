function toBuffer(obj) {
    return Buffer.from(JSON.stringify(obj));
}

function toObject(buf) {
    return JSON.parse(buf.toString());
}

module.exports = {
    toBuffer, toObject
};

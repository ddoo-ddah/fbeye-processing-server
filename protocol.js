function toBuffer(obj) {
    return Buffer.from(JSON.stringify(obj));
}

function toObject(buf) {
    const obj = JSON.parse(buf.toString());
    obj.type = obj.type.toLowerCase();
    return obj;
}

module.exports = {
    toBuffer, toObject
};

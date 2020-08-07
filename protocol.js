const dataTypes = {
    sin: Buffer.from('SIN'), // Sign IN
    res: Buffer.from('RES'), // RESponse
    err: Buffer.from('ERR'), // ERRor
    inf: Buffer.from('INF'), // INFormation
    aut: Buffer.from('AUT'), // AUThentication code
    tes: Buffer.from('TES'), // TESt
    btn: Buffer.from('BTN'), // BuTtoN coordinate
    que: Buffer.from('QUE'), // QUEstion
    ans: Buffer.from('ANS'), // ANSwer
    key: Buffer.from('KEY'), // KEY
    eye: Buffer.from('EYE'), // EYE tracking
    msg: Buffer.from('MSG') // MeSsaGe
};

function toBuffer(obj) {
    const size = Buffer.allocUnsafe(4);
    size.writeInt32BE(3 + obj.data.length, 0);
    return Buffer.concat([size, obj.dataType, obj.data]);
}

function toObject(buf) {
    const size = buf.readInt32BE(0);
    return {
        dataType: buf.slice(4, 7),
        data: buf.slice(7, 4 + size)
    };
}

module.exports = {
    dataTypes, toBuffer, toObject
};

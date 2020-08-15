function remove(arr, element) {
    return arr.splice(arr.indexOf(element), 1)[0];
};

module.exports = {
    remove
};

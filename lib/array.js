Array.prototype.remove = function (element) {
    return this.splice(this.indexOf(element), 1)[0];
};

// string
(function () {
    if (typeof Object.defineProperty === 'function') {
        try { Object.defineProperty(String.prototype, 'format', { value: frmt }); } catch (e) { }
    }
    if (!String.prototype.format) String.prototype.format = frmt;
    function frmt() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ?
              args[number]
              : match
            ;
        });
    };
})();
// array
(function () {
    if (typeof Object.defineProperty === 'function') {
        try { Object.defineProperty(Array.prototype, 'shuffle', { value: shffl }); } catch (e) { }
    }
    if (!Array.prototype.shuffle) Array.prototype.shuffle = shffl;
    function shffl() {
        for (var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
        return this;
    };
})();
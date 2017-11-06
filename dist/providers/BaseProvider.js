"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var throwIfNotExists = exports.throwIfNotExists = function throwIfNotExists(error, body) {
    if (!body) {
        throw new Error(error || "Failed to load item");
    }
    return body;
};

var throwIfExists = exports.throwIfExists = function throwIfExists(error, body) {
    if (body) {
        throw new Error(error || "Item already exists");
    }
    return body;
};
//# sourceMappingURL=BaseProvider.js.map
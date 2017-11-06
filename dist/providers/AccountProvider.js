"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseProvider = require("./BaseProvider");

var BaseProvider = _interopRequireWildcard(_BaseProvider);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var updatePassword = function updatePassword(validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        validate("old_password", "old_password cannot be empty").notEmpty();
        validate("new_password", "new_password cannot be empty").notEmpty();
        validationResult.then(function (result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                body.old_password = _crypto2.default.createHash("sha256").update(body.old_password).digest("base64");
                body.new_password = _crypto2.default.createHash("sha256").update(body.new_password).digest("base64");
                resolve(body);
            }
        });
    });
};
exports.default = {
    BaseProvider: BaseProvider,
    updatePassword: updatePassword
};
//# sourceMappingURL=AccountProvider.js.map
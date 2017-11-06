"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseProvider = require("./BaseProvider");

var BaseProvider = _interopRequireWildcard(_BaseProvider);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var changeUnreadStatus = function changeUnreadStatus(validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        validate("mongo_id", "mongo_id cannot be empty").notEmpty();
        validationResult.then(function (result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                resolve(body);
            }
        });
    });
};

var deleteEmail = function deleteEmail(validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        validate("mongo_id", "mongo_id cannot be empty").notEmpty();
        validationResult.then(function (result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                resolve(body);
            }
        });
    });
};
exports.default = {
    BaseProvider: BaseProvider,
    changeUnreadStatus: changeUnreadStatus,
    deleteEmail: deleteEmail
};
//# sourceMappingURL=MailProvider.js.map
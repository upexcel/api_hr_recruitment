"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseProvider = require("./BaseProvider");

var BaseProvider = _interopRequireWildcard(_BaseProvider);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _emailExistence = require("email-existence");

var _emailExistence2 = _interopRequireDefault(_emailExistence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* Provider for User Registration */

var save = function save(model, validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        validate("username", "username cannot be empty").notEmpty();
        validate("email", "email cannot be empty").notEmpty();
        validate("smtp_server", "smtp_server cannot be empty").notEmpty();
        validate("type", "type cannot be empty").notEmpty();
        validate("password", "password cannot be empty").notEmpty();
        validate("server_port", "port cannot be empty and must be integer").notEmpty().isInt();
        validationResult.then(function (result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                resolve(body);
                reject("Invalid Email Details");
            }
        });
    });
};

var changeStatus = function changeStatus(model, validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        validate("email", "email cannot be empty").notEmpty();
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
    save: save,
    changeStatus: changeStatus
};
//# sourceMappingURL=SmtpProvider.js.map
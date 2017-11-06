"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseProvider = require("./BaseProvider");

var BaseProvider = _interopRequireWildcard(_BaseProvider);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* Provider for User Registration */
var save = function save(model, validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        validate("email", "email cannot be empty").notEmpty();
        validate("password", "password cannot be empty").notEmpty();
        validate("last_fetched_time", "Last Fetched Time cannot be empty");
        validationResult.then(function (result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                body.last_fetched_time = (0, _moment2.default)(body.last_fetched_time).format("YYYY-MM-DD");
                resolve(body);
            }
        });
    });
};
var statusActive = function statusActive(model, validate, body, validationResult) {
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
    statusActive: statusActive
};
//# sourceMappingURL=ImapProvider.js.map
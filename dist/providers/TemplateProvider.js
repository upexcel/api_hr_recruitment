"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _BaseProvider = require("./BaseProvider");

var BaseProvider = _interopRequireWildcard(_BaseProvider);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* Provider for User Registration */
var save = function save(model, validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        validate("templateName", "Template Name cannot be empty").notEmpty();
        validate("subject", "Subject cannot be empty").notEmpty();
        validate("body", "Body cannot be empty").notEmpty();
        validationResult.then(function (result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                resolve(body);
            }
        });
    });
};

var templateEmail = function templateEmail(model, validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        validate("subject", "Subject cannot be empty").notEmpty();
        validate("body", "body cannot be empty").notEmpty();
        validationResult.then(function (result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                resolve(body);
            }
        });
    });
};
exports.default = _extends({}, BaseProvider, {
    save: save,
    templateEmail: templateEmail
});
//# sourceMappingURL=TemplateProvider.js.map
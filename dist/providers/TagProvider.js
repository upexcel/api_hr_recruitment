"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseProvider = require("./BaseProvider");

var BaseProvider = _interopRequireWildcard(_BaseProvider);

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* Provider for User Registration */
var save = function save(model, type, validate, body, validationResult) {
    return new Promise(function (resolve, reject) {
        if (type) {
            validate("title", "Title cannot be empty").notEmpty();
            validate("color", "color cannot be empty").notEmpty();
        } else if (type === (0, _constant2.default)().tagType.automatic) {
            validate("title", "Title cannot be empty").notEmpty();
            validate("color", "color cannot be empty").notEmpty();
        } else {
            reject("Invalid Type");
        }
        if (body.is_job_profile_tag) validate("job_description", "job_description cannot be empty").notEmpty();
        validationResult.then(function (result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                body.type = type;
                body.assign_to_all_emails = body.assign || body.assign_to_all_emails;
                delete body.assign;
                if (body.template_id == "") {
                    delete body.template_id;
                    if (body.to == "" && body.from == "") {
                        delete body.to;
                        delete body.from;
                    }
                    resolve(body);
                } else {
                    if (body.to == "" && body.from == "") {
                        delete body.to;
                        delete body.from;
                    }
                    resolve(body);
                }
            }
        });
    });
};
exports.default = {
    BaseProvider: BaseProvider,
    save: save
};
//# sourceMappingURL=TagProvider.js.map
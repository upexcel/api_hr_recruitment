"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userActivityLogs = function userActivityLogs(req, response) {
    return new Promise(function (resolve, reject) {
        if (!req.user) {
            resolve();
        } else {
            var api_log_record = true;
            _lodash2.default.forEach((0, _constant2.default)().ignored_api_log_list, function (val, key) {
                if (req.path.match(new RegExp(val, 'gi'))) {
                    api_log_record = false;
                }
                if (key == (0, _constant2.default)().ignored_api_log_list.length - 1 && !api_log_record) {
                    resolve();
                }
            });
            if (api_log_record) {
                var data = response;
                response = response.data ? response.data : response.dataValues;
                req.user_activity.findOne({ email: req.user.email }).exec(function (err, result) {
                    if (result) {
                        req.user_activity.update({ "email": req.user.email }, { "$push": { "action": req.originalUrl.toString(), "time": new Date().toString(), "json": response || data } }).exec(function (err, result) {
                            resolve("sucess");
                        });
                    } else {
                        var activity = new req.user_activity({ "email": req.user.email, "action": [req.originalUrl.toString()], time: [new Date().toString()], json: [response || data] });
                        activity.save(function (err, result) {
                            resolve("sucess");
                        });
                    }
                });
            }
        }
    });
};

exports.default = {
    userActivityLogs: userActivityLogs
};
//# sourceMappingURL=userActivity.js.map
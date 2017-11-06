"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _util = require("../lib/util");

var _util2 = _interopRequireDefault(_util);

var _userActivity = require("../service/userActivity");

var _userActivity2 = _interopRequireDefault(_userActivity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseAPIController = function () {
    function BaseAPIController() {
        _classCallCheck(this, BaseAPIController);

        this._db = _db2.default;
    }

    _createClass(BaseAPIController, [{
        key: "handleErrorResponse",
        value: function handleErrorResponse(res, err, next) {
            res.status(400).send((0, _util2.default)(err));
        }
    }, {
        key: "handleSuccessResponse",
        value: function handleSuccessResponse(req, res, next, data) {
            _userActivity2.default.userActivityLogs(req, data).then(function (response) {
                res.json(data);
            });
        }
    }, {
        key: "getById",
        value: function getById(req, res, model, id, next) {
            model.findById(id).then(function (data) {
                if (data) {
                    req.result = data;
                    next();
                } else {
                    res.status(400).send((0, _util2.default)("Invalid Id"));
                }
            });
        }
    }, {
        key: "getCount",
        value: function getCount(req, res, next, where) {
            req.email.find(where).count().exec(function (err, data) {
                if (err) {
                    next(err);
                } else {
                    req.count = data;
                    next();
                }
            });
        }
    }]);

    return BaseAPIController;
}();

exports.default = BaseAPIController;
//# sourceMappingURL=BaseAPIController.js.map
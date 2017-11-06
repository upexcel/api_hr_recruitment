"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UserController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _UserProvider = require("../providers/UserProvider.js");

var _UserProvider2 = _interopRequireDefault(_UserProvider);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserController = exports.UserController = function (_BaseAPIController) {
    _inherits(UserController, _BaseAPIController);

    function UserController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, UserController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = UserController.__proto__ || Object.getPrototypeOf(UserController)).call.apply(_ref, [this].concat(args))), _this), _this.create = function (req, res, next) {
            _UserProvider2.default.create(_this._db.User, req.checkBody, req.body, req.getValidationResult()).then(function (user) {
                var user_type = user.user_type;
                var allowed_role = (0, _constant2.default)().userType;
                if ((user_type == allowed_role.admin || user_type == allowed_role.hr || user_type == allowed_role.guest) && req.user.id) {
                    _this._db.User.create(user).then(function (data) {
                        _this.handleSuccessResponse(req, res, next, data);
                    }, function (err) {
                        throw new Error(res.json(400, {
                            error: 1,
                            message: err,
                            data: []
                        }));
                    });
                } else {
                    throw new Error(res.json(400, {
                        error: 1,
                        message: "Invalid User Type",
                        data: []
                    }));
                }
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.login = function (req, res, next) {
            var login = _UserProvider2.default.login(_this._db.User, req.body);
            _this._db.User.login(login).then(function (data) {
                _this.handleSuccessResponse(req, res, next, data);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.list = function (req, res, next) {
            _this._db.User.userFindAll(req.user, req.params.page, req.params.limit).then(function (data) {
                _this.handleSuccessResponse(req, res, next, { error: 0, message: "success", data: data });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.deleteUser = function (req, res, next) {
            _this._db.User.userDelete(req.user, req.params.id).then(function (data) {
                _this.handleSuccessResponse(req, res, next, { error: 0, message: "success", data: data });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.idResult = function (req, res, next, id) {
            _this.getById(req, res, _this._db.User, id, next);
        }, _this.logs = function (req, res, next) {
            var email = req.params.email_id;
            _this._db.User.logs(req.user_activity, email).then(function (data) {
                if (data.length) _this.handleSuccessResponse(req, res, next, { error: 0, message: "success", data: data });else _this.handleSuccessResponse(req, res, next, { error: 0, message: "No Logs Found", data: data });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    /* Controller for User Register  */


    /* Controller for User Login  */


    /*controller for user list*/


    /*Controller for user delete*/


    /*Find Id result*/


    return UserController;
}(_BaseAPIController3.default);

var controller = new UserController();
exports.default = controller;
//# sourceMappingURL=user.js.map
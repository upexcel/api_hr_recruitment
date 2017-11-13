"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AccountController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _AccountProvider = require("../providers/AccountProvider");

var _AccountProvider2 = _interopRequireDefault(_AccountProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AccountController = exports.AccountController = function (_BaseAPIController) {
    _inherits(AccountController, _BaseAPIController);

    function AccountController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, AccountController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AccountController.__proto__ || Object.getPrototypeOf(AccountController)).call.apply(_ref, [this].concat(args))), _this), _this.forgot_password = function (req, res, next) {
            _this._db.User.findOne({ where: { email: req.params.email } }).then(function (user) {
                if (user) {
                    _this._db.User.forgotPassword(req.params.email).then(function (response) {
                        _this.handleSuccessResponse(req, res, next, response);
                    }, function (err) {
                        next(res.status(400).send({ message: err }));
                    });
                } else {
                    _this.handleSuccessResponse(req, res, next, { message: "If email exists, new password will be send to your email !!" });
                }
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.update_password = function (req, res, next) {
            _AccountProvider2.default.updatePassword(req.checkBody, req.body, req.getValidationResult()).then(function (body) {
                _this._db.User.update({ password: body.new_password }, { where: { id: req.user.id, password: body.old_password } }).then(function (user) {
                    if (user && user[0]) {
                        _this.handleSuccessResponse(req, res, next, { message: 'password updated successfully' });
                    } else {
                        next(res.status(400).send({ message: "Incorrect Old password" }));
                    }
                }, function (err) {
                    _this.handleErrorResponse.bind(null, err);
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }
    /*forgot password*/


    /*update password*/


    return AccountController;
}(_BaseAPIController3.default);

var controller = new AccountController();
exports.default = controller;
//# sourceMappingURL=account.js.map
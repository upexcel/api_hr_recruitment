"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SmtpController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _SmtpProvider = require("../providers/SmtpProvider");

var _SmtpProvider2 = _interopRequireDefault(_SmtpProvider);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _mail = require("../modules/mail");

var _mail2 = _interopRequireDefault(_mail);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SmtpController = exports.SmtpController = function (_BaseAPIController) {
    _inherits(SmtpController, _BaseAPIController);

    function SmtpController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, SmtpController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = SmtpController.__proto__ || Object.getPrototypeOf(SmtpController)).call.apply(_ref, [this].concat(args))), _this), _this.save = function (req, res, next) {
            _SmtpProvider2.default.save(_this._db.Smtp, req.checkBody, req.body, req.getValidationResult()).then(function (data) {
                _mail2.default.sendMail(data.email, (0, _constant2.default)().smtp.subject, (0, _constant2.default)().smtp.text, data, (0, _constant2.default)().smtp.html).then(function (response) {
                    _this._db.Smtp.create(data).then(function (data) {
                        _this._db.Smtp.changeStatus(data.email).then(function (response_status) {
                            _this.handleSuccessResponse(req, res, next, { response_status: response_status, data: data.dataValues });
                        });
                    }, function (err) {
                        throw new Error(res.json(400, {
                            message: "Data Already Saved"
                        }));
                    }).catch(_this.handleErrorResponse.bind(null, res));
                }).catch(_this.handleErrorResponse.bind(null, res));
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.update = function (req, res, next) {
            _SmtpProvider2.default.save(_this._db.Smtp, req.checkBody, req.body, req.getValidationResult()).then(function (data) {
                _this._db.Smtp.update(data, {
                    where: {
                        id: req.params.smtpId
                    }
                }).then(function (docs) {
                    _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.deleteSmtp = function (req, res, next) {
            _this._db.Smtp.destroy({
                where: {
                    id: req.params.smtpId
                }
            }).then(function (docs) {
                _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.getSmtp = function (req, res, next) {
            _this._db.Smtp.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit),
                order: '`id` DESC'
            }).then(function (data) {
                return _this.handleSuccessResponse(req, res, next, data);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.getSmtpById = function (req, res, next) {
            _this.handleSuccessResponse(req, res, next, req.result);
        }, _this.testSmtp = function (req, res, next) {
            _this._db.Smtp.testSmtp(req.params.email).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.changeStatus = function (req, res, next) {
            _this._db.Smtp.changeStatus(req.params.email).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.idResult = function (req, res, next, smtpId) {
            _this.getById(req, res, _this._db.Smtp, smtpId, next);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    /* Controller for Save Smtp Data  */


    /* Smtp data Update */


    /* Smtp data delete */


    /* Get Smtp data */


    /* get smtp by id*/


    /* test smtp by email*/


    /* change smtp status*/


    /* Get Smtpp data using id */


    return SmtpController;
}(_BaseAPIController3.default);

var controller = new SmtpController();
exports.default = controller;
//# sourceMappingURL=smtp.js.map
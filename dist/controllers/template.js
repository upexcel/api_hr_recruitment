"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TemplateController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _TemplateProvider = require("../providers/TemplateProvider.js");

var _TemplateProvider2 = _interopRequireDefault(_TemplateProvider);

var _replaceVariable = require("../modules/replaceVariable");

var _replaceVariable2 = _interopRequireDefault(_replaceVariable);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _mail = require("../modules/mail");

var _mail2 = _interopRequireDefault(_mail);

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _emaillogs = require("../service/emaillogs");

var _emaillogs2 = _interopRequireDefault(_emaillogs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TemplateController = exports.TemplateController = function (_BaseAPIController) {
    _inherits(TemplateController, _BaseAPIController);

    function TemplateController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, TemplateController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = TemplateController.__proto__ || Object.getPrototypeOf(TemplateController)).call.apply(_ref, [this].concat(args))), _this), _this.create = function (req, res, next) {
            _TemplateProvider2.default.save(_this._db, req.checkBody, req.body, req.getValidationResult()).then(function (template) {
                _this._db.Template.create(template).then(function (data) {
                    _this.handleSuccessResponse(req, res, next, data);
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.update = function (req, res, next) {
            _TemplateProvider2.default.save(_this._db, req.checkBody, req.body, req.getValidationResult()).then(function (data) {
                _this._db.Template.update(data, {
                    where: {
                        id: req.params.templateId
                    }
                }).then(function (docs) {
                    _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.deleteTemplate = function (req, res, next) {
            _db2.default.Tag.findOne({ where: { template_id: req.params.templateId } }).then(function (data) {
                if (!data) {
                    _this._db.Template.destroy({
                        where: {
                            id: req.params.templateId
                        }
                    }).then(function (docs) {
                        _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                    }).catch(_this.handleErrorResponse.bind(null, res));
                } else {
                    throw new Error("Template is Assigned to Tag");
                }
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.templateList = function (req, res, next) {
            _this._db.Template.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit),
                order: '`id` DESC'
            }).then(function (data) {
                return _this.handleSuccessResponse(req, res, next, data);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.templateTest = function (req, res, next) {
            _this._db.Template.findById(req.params.templateId).then(function (data) {
                _replaceVariable2.default.templateTest(data.body).then(function (data) {
                    _this.handleSuccessResponse(req, res, next, data);
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.templateEmail = function (req, res, next) {
            _TemplateProvider2.default.templateEmail(_this._db, req.checkBody, req.body, req.getValidationResult()).then(function (template) {
                _this._db.Smtp.findOne({ where: { status: true } }).then(function (data) {
                    if (data) {
                        if (_config2.default.is_silent) {
                            _mail2.default.sendMail(req.params.email, template.subject, (0, _constant2.default)().smtp.text, data, template.body).then(function (response) {
                                _emaillogs2.default.emailLog(req, data.email_status).then(function (response) {
                                    _this.handleSuccessResponse(req, res, next, response);
                                });
                            });
                        } else {
                            _this.handleSuccessResponse(req, res, next, { message: "Tempelte Tested" });
                        }
                    } else {
                        throw new Error("Not Active Smtp Email is found");
                    }
                }).catch(_this.handleErrorResponse.bind(null, res));
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.idResult = function (req, res, next, templateId) {
            _this.getById(req, res, _this._db.Template, templateId, next);
        }, _this.getTemplateById = function (req, res, next) {
            _this._db.Template.findById(parseInt(req.params.templateId)).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    /* Controller for User Register  */


    /* Template Update */


    /* Template delete */


    /* Get List of All Templates */


    /* Template  Test */


    /* Send Email */


    /* Get Variable data using id*/


    return TemplateController;
}(_BaseAPIController3.default);

var controller = new TemplateController();
exports.default = controller;
//# sourceMappingURL=template.js.map
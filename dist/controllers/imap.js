"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ImapController = undefined;

var _imap = require("imap");

var _imap2 = _interopRequireDefault(_imap);

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _ImapProvider = require("../providers/ImapProvider");

var _ImapProvider2 = _interopRequireDefault(_ImapProvider);

var _imap3 = require("../service/imap");

var _imap4 = _interopRequireDefault(_imap3);

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _emailprocess = require("../mongodb/emailprocess");

var _emailprocess2 = _interopRequireDefault(_emailprocess);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ImapController = exports.ImapController = function (_BaseAPIController) {
    _inherits(ImapController, _BaseAPIController);

    function ImapController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, ImapController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ImapController.__proto__ || Object.getPrototypeOf(ImapController)).call.apply(_ref, [this].concat(args))), _this), _this.save = function (req, res, next) {
            _ImapProvider2.default.save(_this._db.Imap, req.checkBody, req.body, req.getValidationResult()).then(function (dataValues) {
                var tag = {
                    dataValues: {
                        email: dataValues.email,
                        password: dataValues.password,
                        last_fetched_time: dataValues.last_fetched_time
                    }
                };
                _imap4.default.imapCredential(tag).then(function (imap) {
                    _imap4.default.imapConnection(imap).then(function (connection) {
                        dataValues.total_emails = connection.messages.total;
                        _db2.default.Imap.create(dataValues).then(function (data) {
                            _this.handleSuccessResponse(req, res, next, data);
                        }).catch(_this.handleErrorResponse.bind(null, res));
                    }).catch(_this.handleErrorResponse.bind(null, res));
                }, function (err) {
                    throw new Error(res.json(400, { message: err }));
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.update = function (req, res, next) {
            _ImapProvider2.default.save(_this._db.Imap, req.checkBody, req.body, req.getValidationResult()).then(function (data) {
                _this._db.Imap.update(data, {
                    where: {
                        id: req.params.imapId
                    }
                }).then(function (docs) {
                    _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.deleteImap = function (req, res, next) {
            _this._db.Imap.destroy({
                where: {
                    id: req.params.imapId
                }
            }).then(function (docs) {
                _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.getImap = function (req, res, next) {
            _this._db.Imap.findAll({ order: '`id` DESC' }).then(function (response) {
                _emailprocess2.default.getFetchedMailCount(response, req.email).then(function (result) {
                    _this.handleSuccessResponse(req, res, next, result);
                }).catch(_this.handleErrorResponse.bind(null, res));
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.statusActive = function (req, res, next) {
            _this._db.Imap.imapTest(req.params.email).then(function (data) {
                return _this.handleSuccessResponse(req, res, next, data);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.idResult = function (req, res, next, imapId) {
            _this.getById(req, res, _this._db.Imap, imapId, next);
        }, _this.getImapById = function (req, res, next) {
            _this.handleSuccessResponse(req, res, next, req.result);
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    /* Controller for Save Imap Data  */


    /* Imap data Update */


    /* Imap data delete */


    /* Get Imap data */


    /* Imap Active  Status */


    /* Get Imapp data using id */


    return ImapController;
}(_BaseAPIController3.default);

var controller = new ImapController();
exports.default = controller;
//# sourceMappingURL=imap.js.map
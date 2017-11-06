"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FetchController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _MailProvider = require("../providers/MailProvider");

var _MailProvider2 = _interopRequireDefault(_MailProvider);

var _getAttachment = require("../modules/getAttachment");

var _getAttachment2 = _interopRequireDefault(_getAttachment);

var _imap = require("../service/imap");

var _imap2 = _interopRequireDefault(_imap);

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _inbox = require("../inbox");

var _inbox2 = _interopRequireDefault(_inbox);

var _db = require("../db");

var _db2 = _interopRequireDefault(_db);

var _mail = require("../modules/mail");

var _mail2 = _interopRequireDefault(_mail);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _replaceVariable = require("../modules/replaceVariable");

var _replaceVariable2 = _interopRequireDefault(_replaceVariable);

var _emailprocess = require("../mongodb/emailprocess");

var _emailprocess2 = _interopRequireDefault(_emailprocess);

var _emaillogs = require("../service/emaillogs");

var _emaillogs2 = _interopRequireDefault(_emaillogs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FetchController = exports.FetchController = function (_BaseAPIController) {
    _inherits(FetchController, _BaseAPIController);

    function FetchController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, FetchController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = FetchController.__proto__ || Object.getPrototypeOf(FetchController)).call.apply(_ref, [this].concat(args))), _this), _this.fetch = function (req, res, next) {
            var _req$params = req.params,
                page = _req$params.page,
                tag_id = _req$params.tag_id,
                limit = _req$params.limit;
            var _req$body = req.body,
                type = _req$body.type,
                keyword = _req$body.keyword,
                selected = _req$body.selected,
                default_id = _req$body.default_id,
                is_attach = _req$body.is_attach;

            _this._db.Tag.findAll({ where: { type: "Default" } }).then(function (default_tag) {
                _emailprocess2.default.fetchEmail(page, tag_id, limit, type, keyword, selected, default_id, default_tag, req.email, is_attach).then(function (data, message) {
                    _this.handleSuccessResponse(req, res, next, {
                        data: data,
                        status: 1,
                        count: req.count,
                        message: data.length ? "SUCCESS" : "No Emails Found"
                    });
                }).catch(_this.handleErrorResponse.bind(null, res));
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.assignTag = function (req, res, next) {
            var _req$params2 = req.params,
                tag_id = _req$params2.tag_id,
                mongo_id = _req$params2.mongo_id;

            _this._db.Tag.findOne({ where: { id: tag_id } }).then(function (data) {
                if (data.id) {
                    req.email.findOneAndUpdate({ "_id": mongo_id }, { "$addToSet": { "tag_id": tag_id }, email_timestamp: new Date().getTime() }).exec(function (err, data) {
                        if (err) {
                            next(new Error(err));
                        } else {
                            _this.handleSuccessResponse(req, res, next, {
                                data: data,
                                status: 1,
                                message: "success"
                            });
                        }
                    });
                } else {
                    next(new Error("invalid tag id"));
                }
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.countEmail = function (req, res, next) {
            _emailprocess2.default.findcount(req.email).then(function (data) {
                _this.handleSuccessResponse(req, res, next, data);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.assignMultiple = function (req, res, next) {
            var where = void 0;
            _MailProvider2.default.changeUnreadStatus(req.checkBody, req.body, req.getValidationResult()).then(function () {
                var tag_id = req.params.tag_id;

                _emailprocess2.default.assignMultiple(tag_id, req.body, req.email).then(function (data) {
                    _emaillogs2.default.emailLog(req, data.email_status).then(function (response) {
                        _this.handleSuccessResponse(req, res, next, data);
                    });
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.deleteTag = function (req, res, next) {
            _MailProvider2.default.deleteEmail(req.checkBody, req.body, req.getValidationResult()).then(function () {
                _emailprocess2.default.deleteTag(req.params.tag_id, req.body.mongo_id, req.email).then(function (result) {
                    _this.handleSuccessResponse(req, res, next, result);
                }).catch(_this.handleErrorResponse(null, res));
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.changeUnreadStatus = function (req, res, next) {
            var mongo_id = req.params.mongo_id;

            var status = (req.params.status + '').toLowerCase() === 'true';
            req.email.find({ _id: mongo_id }, function (err) {
                if (err) {
                    next(new Error(err));
                } else if (status == false) {
                    req.email.update({ _id: mongo_id }, { unread: status, read_email_time: new Date(), read_by_user: req.user.email }, function (error) {
                        if (error) {
                            next(new Error(err));
                        } else {
                            _this.handleSuccessResponse(req, res, next, { status: 1, message: "the unread status is successfully changed to " + req.params.status });
                        }
                    });
                } else {
                    _this.handleSuccessResponse(req, res, next, { status: 0, message: "the unread status is not changed successfully,  you have to set status true or false" });
                }
            });
        }, _this.deleteEmail = function (req, res, next) {
            _MailProvider2.default.deleteEmail(req.checkBody, req.body, req.getValidationResult()).then(function () {
                _emailprocess2.default.deleteEmail(req.params.tag_id, req.body.mongo_id, req.email).then(function (result) {
                    _this.handleSuccessResponse(req, res, next, result);
                }).catch(_this.handleErrorResponse(null, res));
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.mailAttachment = function (req, res, next) {
            _emailprocess2.default.mailAttachment(req.params.mongo_id, req.email).then(function (result) {
                _this.handleSuccessResponse(req, res, next, result);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.findByTagId = function (req, res, next, tag_id) {
            var _req$body2 = req.body,
                type = _req$body2.type,
                keyword = _req$body2.keyword,
                selected = _req$body2.selected,
                default_id = _req$body2.default_id,
                is_attach = _req$body2.is_attach;

            _emailprocess2.default.fetchById(type, keyword, selected, default_id, tag_id, is_attach).then(function (data) {
                _this.getCount(req, res, next, data);
            });
        }, _this.sendToMany = function (req, res, next) {
            var _req$body3 = req.body,
                subject = _req$body3.subject,
                body = _req$body3.body,
                tag_id = _req$body3.tag_id,
                default_id = _req$body3.default_id;

            _emailprocess2.default.sendToMany(req, req.body.emails, subject, body, tag_id, default_id, req.email).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.sendToSelectedTag = function (req, res, next) {
            _emailprocess2.default.sendToSelectedTag(req, req.body.tag_id, req.email).then(function (result) {
                _this.handleSuccessResponse(req, res, next, result);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.fetchByButton = function (req, res, next) {
            _inbox2.default.fetchEmail(req.email, req.emailLogs, 'apiCall').then(function (data) {
                _this.handleSuccessResponse(req, res, next, { status: 1, message: "success" });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.app_get_candidate = function (req, res, next) {
            _emailprocess2.default.app_get_candidate(req.email, req.body.registration_id).then(function (result) {
                _this.handleSuccessResponse(req, res, next, { error: 0, message: "", data: result });
            }).catch(function (err) {
                _this.handleSuccessResponse(req, res, next, err);
            });
        }, _this.logs = function (req, res, next) {
            var _req$params3 = req.params,
                page = _req$params3.page,
                limit = _req$params3.limit;

            req.emailLogs.find().sort({ _id: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec().then(function (result) {
                req.emailLogs.count().exec().then(function (count) {
                    _this.handleSuccessResponse(req, res, next, { error: 0, message: "", data: result, count: count });
                });
            }).catch(function (err) {
                _this.handleSuccessResponse(req, res, next, err);
            });
        }, _this.searchLogs = function (req, res, next) {
            var _req$params4 = req.params,
                page = _req$params4.page,
                email = _req$params4.email,
                limit = _req$params4.limit;

            req.emailLogs.find({ email: { "$regex": email } }).sort({ _id: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)).exec().then(function (result) {
                req.emailLogs.count({ email: { "$regex": email } }).exec().then(function (count) {
                    if (count) _this.handleSuccessResponse(req, res, next, { error: 0, message: "", data: result, count: count });else _this.handleSuccessResponse(req, res, next, { error: 0, message: "No Result Found", data: [], count: count });
                });
            }).catch(function (err) {
                _this.handleSuccessResponse(req, res, next, err);
            });
        }, _this.emailStatus = function (req, res, next) {
            _emailprocess2.default.checkEmailStatus(req).then(function (response) {
                return _this.handleSuccessResponse(req, res, next, response);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.fetchByDates = function (req, res, next) {
            _emailprocess2.default.findEmailByDates(req.params.days, req.email).then(function (response) {
                _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
            }).catch(function (err) {
                console.log(err);
            });
        }, _this.sendToNotReplied = function (req, res, next) {
            _emailprocess2.default.sendToNotReplied(req).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _this.sendBySelection = function (req, res, next) {
            _emailprocess2.default.sendBySelection(req).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _this.insert_note = function (req, res, next) {
            _emailprocess2.default.insert_note(req).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _this.update_note = function (req, res, next) {
            _emailprocess2.default.update_note(req).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _this.cron_status = function (req, res, next) {
            _emailprocess2.default.cron_status(req).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _this.archiveEmails = function (req, res, next) {
            _emailprocess2.default.archiveEmails(req.body, req.email, req.archived).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _this.markAsUnread = function (req, res, next) {
            req.email.update({ _id: req.body.mongo_id }, { unread: true }).then(function (response) {
                _this.handleSuccessResponse(req, res, next, { message: "marked as unread" });
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }
    /* Get INBOX data */


    return FetchController;
}(_BaseAPIController3.default);

var controller = new FetchController();
exports.default = controller;
//# sourceMappingURL=fetchEmail.js.map
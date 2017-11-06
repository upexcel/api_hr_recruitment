"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TagController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _TagProvider = require("../providers/TagProvider");

var _TagProvider2 = _interopRequireDefault(_TagProvider);

var _constant = require("../models/constant");

var _constant2 = _interopRequireDefault(_constant);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _emailprocess = require("../mongodb/emailprocess");

var _emailprocess2 = _interopRequireDefault(_emailprocess);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TagController = exports.TagController = function (_BaseAPIController) {
    _inherits(TagController, _BaseAPIController);

    function TagController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, TagController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = TagController.__proto__ || Object.getPrototypeOf(TagController)).call.apply(_ref, [this].concat(args))), _this), _this.save = function (req, res, next) {
            var assign = req.body.assign;
            _TagProvider2.default.save(_this._db, req.params.type, req.checkBody, req.body, req.getValidationResult()).then(function (response) {
                response.parent_id = response.parent_id ? parseInt(response.parent_id) : 0;
                _this._db.Tag.create(response).then(function (data) {
                    if (data) {
                        if (data.type == (0, _constant2.default)().tagType.automatic && assign === true) {
                            _emailprocess2.default.assignToOldTag(data, req.email).then(function (result) {
                                _this.handleSuccessResponse(req, res, next, result);
                            });
                        } else if (data.type == (0, _constant2.default)().tagType.default) {
                            _emailprocess2.default.assignToNewTag(data, req.email).then(function (result) {
                                _this.handleSuccessResponse(req, res, next, result);
                            });
                        } else {
                            _this.handleSuccessResponse(req, res, next, data);
                        }
                    } else {
                        res.status(500).send({ message: "Tag is not Added" });
                    }
                }, function (err) {
                    res.status(500).json({ message: err });
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.update = function (req, res, next) {
            var assign = req.body.assign_to_all_emails;
            _TagProvider2.default.save(_this._db.Imap, req.params.type, req.checkBody, req.body, req.getValidationResult()).then(function (data) {
                _this._db.Tag.update(data, {
                    where: {
                        id: req.params.tagId,
                        type: req.params.type
                    }
                }).then(function (docs) {
                    if (assign) {
                        _this._db.Tag.assignTagDuringUpdate(req.params.tagId, req).then(function (response) {
                            _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                        });
                    } else {
                        _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                    }
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.deleteTag = function (req, res, next) {
            if (req.params.type == (0, _constant2.default)().tagType.automatic || req.params.type == (0, _constant2.default)().tagType.manual || req.params.type == (0, _constant2.default)().tagType.default) {
                if (req.params.type == (0, _constant2.default)().tagType.default) {
                    _this._db.Tag.destroyDefault(req.email, _this._db, req.params.tagId, req.params.type).then(function (status) {
                        _this.handleSuccessResponse(req, res, next, { status: status });
                    }).catch(_this.handleErrorResponse.bind(null, res));
                } else {
                    _this._db.Tag.destroy({ where: { id: req.params.tagId, type: req.params.type } }).then(function (docs) {
                        if (docs) {
                            req.email.update({ tag_id: { $all: [req.params.tagId] } }, { $pull: { tag_id: req.params.tagId } }, { multi: true }).then(function (data) {
                                _this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                            }).catch(_this.handleErrorResponse.bind(null, res));
                        } else {
                            next(res.status(400).send({ message: "Invalid tagId" }));
                        }
                    }).catch(_this.handleErrorResponse.bind(null, res));
                }
            } else {
                next(res.status(400).send({ message: "Invalid tag type " }));
            }
        }, _this.getTag = function (req, res, next) {
            if (req.params.type == (0, _constant2.default)().tagType.automatic || req.params.type == (0, _constant2.default)().tagType.manual || req.params.type == (0, _constant2.default)().tagType.default) {
                _this._db.Tag.findAll({
                    offset: (req.params.page - 1) * parseInt(req.params.limit),
                    limit: parseInt(req.params.limit),
                    where: {
                        type: req.params.type
                    },
                    order: '`id` DESC'
                }).then(function (data) {
                    return _this.handleSuccessResponse(req, res, next, data);
                }).catch(_this.handleErrorResponse.bind(null, res));
            } else {
                next(new Error("Invalid Type"));
            }
        }, _this.getAllTag = function (req, res, next) {
            _this._db.Tag.findAll({ order: '`priority` ASC' }).then(function (data) {
                return _this.handleSuccessResponse(req, res, next, data);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.getTagById = function (req, res, next) {
            if (req.params.type == (0, _constant2.default)().tagType.automatic || req.params.type == (0, _constant2.default)().tagType.manual || req.params.type == (0, _constant2.default)().tagType.default) {
                _this._db.Tag.findOne({
                    where: {
                        id: req.result.id,
                        type: req.params.type
                    }
                }).then(function (data) {
                    return _this.handleSuccessResponse(req, res, next, data);
                }).catch(_this.handleErrorResponse.bind(null, res));
            } else {
                next(new Error("Invalid Type"));
            }
        }, _this.idResult = function (req, res, next, tagId) {
            _this.getById(req, res, _this._db.Tag, tagId, next);
        }, _this.getShedule = function (req, res, next) {
            _emailprocess2.default.getShedule(req.email).then(function (result) {
                _this.handleSuccessResponse(req, res, next, result);
            }).catch(_this.handleErrorResponse);
        }, _this.updatePriority = function (req, res, next) {
            _this._db.Tag.updatePriority(req.body).then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }
    /* Controller for Save Imap Data  */


    /* Imap data Update*/


    /* Imap data delete */

    /* Get Imap data */


    /* Get all tag */


    /* Get tag by id */


    /* Get Imap data using id*/


    /*Get Shedules*/


    /*updatePriority*/


    return TagController;
}(_BaseAPIController3.default);

var controller = new TagController();
exports.default = controller;
//# sourceMappingURL=tag.js.map
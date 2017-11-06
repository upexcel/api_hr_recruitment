"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InboxController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InboxController = exports.InboxController = function (_BaseAPIController) {
    _inherits(InboxController, _BaseAPIController);

    function InboxController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, InboxController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = InboxController.__proto__ || Object.getPrototypeOf(InboxController)).call.apply(_ref, [this].concat(args))), _this), _this.getInbox = function (req, res, next) {
            req.email.find().skip((req.params.page - 1) * parseInt(req.params.limit)).limit(parseInt(req.params.limit)).sort({
                date: -1
            }).exec(function (err, data) {
                if (err) {
                    next(new Error("invalid page"));
                } else {
                    _this.handleSuccessResponse(req, res, next, { data: data });
                }
            });
        }, _this.getByEmailId = function (req, res, next) {
            var re = /\S+@\S+\.\S+/;
            if (re.test(req.params.emailid)) {
                var where = { sender_mail: req.params.emailid };
            } else {
                where = { _id: req.params.emailid };
            }
            req.email.find(where).sort({
                date: -1
            }).exec(function (err, data) {
                if (err) {
                    next(new Error(err));
                } else {
                    _this.handleSuccessResponse(req, res, next, { data: data });
                }
            });
        }, _this.getUid = function (req, res, next) {
            req.email.findOne({
                uid: parseInt(req.params.uid)
            }).exec(function (err, data) {
                if (err) {
                    next(new Error("invalid UID"));
                } else {
                    _this.handleSuccessResponse(req, res, next, { data: data });
                }
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }
    /* Get INBOX data*/


    /* Get Emails By EmailId*/


    /* Get UID data*/


    return InboxController;
}(_BaseAPIController3.default);

var controller = new InboxController();
exports.default = controller;
//# sourceMappingURL=inbox.js.map
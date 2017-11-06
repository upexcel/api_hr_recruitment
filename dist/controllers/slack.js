"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SlackController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SlackController = exports.SlackController = function (_BaseAPIController) {
    _inherits(SlackController, _BaseAPIController);

    function SlackController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, SlackController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = SlackController.__proto__ || Object.getPrototypeOf(SlackController)).call.apply(_ref, [this].concat(args))), _this), _this.addInfo = function (req, res, next) {
            _this._db.Slack.getChannelList(req.body).then(function (response) {
                _this._db.Slack.create(req.body).then(function (response) {
                    _this.handleSuccessResponse(req, res, next, response);
                });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.update = function (req, res, next) {
            _this._db.Slack.update(req.body, { where: { id: req.params.account_id } }).then(function (response) {
                _this.handleSuccessResponse(req, res, next, { status: 1, message: "Slack Info is Updated" });
            });
        }, _this.getSlackData = function (req, res, next) {
            _this._db.Slack.slackData().then(function (response) {
                _this.handleSuccessResponse(req, res, next, response);
            });
        }, _this.getSlackDataByid = function (req, res, next) {
            _this._db.Slack.findOne({ where: { id: req.params.slack_id } }).then(function (response) {
                if (response) _this.handleSuccessResponse(req, res, next, { data: response });else _this.handleSuccessResponse(req, res, next, { data: null });
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _this.deleteSlackInfo = function (req, res, next) {
            _this._db.Slack.destroy({ where: { id: req.params.slack_id } }).then(function (response) {
                _this.handleSuccessResponse(req, res, next, { message: "success" });
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }
    /*add info*/


    /*get channel list*/
    // getChannelList = (req, res, next) => {
    //     this._db.Slack.getChannelList(req.params.account_id)
    //         .then((channelList) => {
    //             this.handleSuccessResponse(req, res, next, channelList)
    //         })
    // }

    /*Update SlackInfo*/

    /*get slack data*/


    /*get slack data by id*/


    /*deleteSlackInfo*/


    return SlackController;
}(_BaseAPIController3.default);

var controller = new SlackController();
exports.default = controller;
//# sourceMappingURL=slack.js.map
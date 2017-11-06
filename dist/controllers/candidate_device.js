"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DeviceController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _candidate_device = require("../providers/candidate_device");

var _candidate_device2 = _interopRequireDefault(_candidate_device);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DeviceController = exports.DeviceController = function (_BaseAPIController) {
    _inherits(DeviceController, _BaseAPIController);

    function DeviceController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, DeviceController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = DeviceController.__proto__ || Object.getPrototypeOf(DeviceController)).call.apply(_ref, [this].concat(args))), _this), _this.save = function (req, res, next) {
            _candidate_device2.default.save(req.checkBody, req.body, req.getValidationResult()).then(function (body) {
                _this._db.Candidate_device.createDevice(body).then(function (data) {
                    _this.handleSuccessResponse(req, res, next, { error: 0, message: 'sucess', data: data });
                }, function (err) {
                    throw new Error(res.json({
                        error: 1,
                        message: err,
                        data: []
                    }));
                });
            }).catch(function (err) {
                _this.handleSuccessResponse(req, res, next, { error: 1, message: err, data: [] });
            });
        }, _this.logout = function (req, res, next) {
            _this._db.Candidate_device.logout(req.body.email_id, req.body.device_id).then(function (data) {
                _this.handleSuccessResponse(req, res, next, { error: 0, message: 'sucess' });
            }, function (err) {
                throw new Error(res.json({
                    error: 1,
                    message: err
                }));
            });
        }, _this.updateMobile = function (req, res, next) {
            req.email.update({ "sender_mail": req.body.email_id, "registration_id": req.body.registration_id }, { "mobile_no": req.body.mobile_no }).exec(function (err, response) {
                if (err) {
                    res.json({
                        error: 1,
                        message: err,
                        data: []
                    });
                } else {
                    res.json({ error: 0, message: 'Mobile Number Updated' });
                }
            });
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    return DeviceController;
}(_BaseAPIController3.default);

var controller = new DeviceController();
exports.default = controller;
//# sourceMappingURL=candidate_device.js.map
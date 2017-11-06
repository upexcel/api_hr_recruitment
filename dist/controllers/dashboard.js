"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DashboardController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

var _dashboard = require("../service/dashboard");

var _dashboard2 = _interopRequireDefault(_dashboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DashboardController = exports.DashboardController = function (_BaseAPIController) {
    _inherits(DashboardController, _BaseAPIController);

    function DashboardController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, DashboardController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = DashboardController.__proto__ || Object.getPrototypeOf(DashboardController)).call.apply(_ref, [this].concat(args))), _this), _this.getDashboard = function (req, res, next) {
            _dashboard2.default.dashboard(_this._db, req).then(function (response) {
                res.json(response);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    return DashboardController;
}(_BaseAPIController3.default);

var controller = new DashboardController();
exports.default = controller;
//# sourceMappingURL=dashboard.js.map
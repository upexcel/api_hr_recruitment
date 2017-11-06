"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VariableController = undefined;

var _BaseAPIController2 = require("./BaseAPIController");

var _BaseAPIController3 = _interopRequireDefault(_BaseAPIController2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VariableController = exports.VariableController = function (_BaseAPIController) {
    _inherits(VariableController, _BaseAPIController);

    function VariableController() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, VariableController);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = VariableController.__proto__ || Object.getPrototypeOf(VariableController)).call.apply(_ref, [this].concat(args))), _this), _this.variableList = function (req, res, next) {
            _this._db.SystemVariable.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit),
                order: '`id` DESC'
            }).then(function (data) {
                _this.handleSuccessResponse(req, res, next, data);
            }).catch(_this.handleErrorResponse.bind(null, res));
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    /* Get List of All Templates */


    return VariableController;
}(_BaseAPIController3.default);

var controller = new VariableController();
exports.default = controller;
//# sourceMappingURL=systemVariable.js.map
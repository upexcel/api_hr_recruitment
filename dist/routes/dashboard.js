"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

var _dashboard = require("../controllers/dashboard");

var _dashboard2 = _interopRequireDefault(_dashboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route("/dashboard").get(_dashboard2.default.getDashboard);

    return app;
};
//# sourceMappingURL=dashboard.js.map
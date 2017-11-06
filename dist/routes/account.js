"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _account = require("../controllers/account");

var _account2 = _interopRequireDefault(_account);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    /* Route for Forgot Password */
    app.route("/account/forgot_password/:email").put(_account2.default.forgot_password);

    /* Route for Update Password */
    app.route("/account/update_password").put(_auth2.default.requiresLogin, _account2.default.update_password);

    return app;
};
//# sourceMappingURL=account.js.map
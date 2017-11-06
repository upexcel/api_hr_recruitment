"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

var _user = require("../controllers/user");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for Token Verification  */
    app.route("/verify").get(_auth2.default.verifyToken);

    /* Route for User Registration  */
    app.route("/user/add_user").post(_auth2.default.requiresAdmin, _user2.default.create);

    /* Route for User Login  */
    app.route("/user/login").post(_user2.default.login);

    /* Route for user list*/
    app.route("/user/list/:page/:limit").get(_auth2.default.requiresAdmin, _user2.default.list);

    /*Route for delete user only by admin*/
    app.route("/user/delete/:id").delete(_auth2.default.requiresAdmin, _user2.default.deleteUser);

    app.route("/user/log/:email_id").get(_auth2.default.requiresAdmin, _user2.default.logs);

    app.param("id", _user2.default.idResult);

    return app;
};
//# sourceMappingURL=auth.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _inbox = require("../controllers/inbox");

var _inbox2 = _interopRequireDefault(_inbox);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for get INBOX */
    app.route("/email/inbox/:page/:limit").get(_auth2.default.requiresLogin, _inbox2.default.getInbox);

    app.route("/email/inbox/:emailid").get(_auth2.default.requiresLogin, _inbox2.default.getByEmailId);

    /* Route for fetch by UID*/
    app.route("/email/:uid").get(_auth2.default.requiresLogin, _inbox2.default.getUid);

    return app;
};
//# sourceMappingURL=inbox.js.map
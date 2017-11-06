"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _smtp = require("../controllers/smtp");

var _smtp2 = _interopRequireDefault(_smtp);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for smtp save  */
    app.route("/smtp/save").post(_auth2.default.requiresAdmin, _smtp2.default.save);

    /* Route for smtp update  */
    app.route("/smtp/update/:smtpId").put(_auth2.default.requiresAdmin, _smtp2.default.update);

    /* Route for smtp Delete */
    app.route("/smtp/delete/:smtpId").delete(_auth2.default.requiresAdmin, _smtp2.default.deleteSmtp);

    /* Route for fetch smtp Data */
    app.route("/smtp/get/:page/:limit").get(_auth2.default.requiresAdmin, _smtp2.default.getSmtp);

    /* Route for fetch Smtp data by id */
    app.route("/smtp/getbyid/:smtpId").get(_auth2.default.requiresAdmin, _smtp2.default.getSmtpById);

    /* Route for  Smtp test */
    app.route("/smtp/testSmtp/:email").put(_auth2.default.requiresAdmin, _smtp2.default.testSmtp);

    /* Route for  change status */
    app.route("/smtp/changeStatus/:email").put(_auth2.default.requiresAdmin, _smtp2.default.changeStatus);

    app.param("smtpId", _smtp2.default.idResult);

    return app;
};
//# sourceMappingURL=smtp.js.map
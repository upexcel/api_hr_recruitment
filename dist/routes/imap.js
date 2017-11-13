"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _imap = require("../controllers/imap");

var _imap2 = _interopRequireDefault(_imap);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for imap save  */
    app.route("/imap/save").post(_auth2.default.requiresAdmin, _imap2.default.save);

    /* Route for imap update  */
    app.route("/imap/update/:imapId").put(_auth2.default.requiresAdmin, _imap2.default.update);

    /* Route for imap Delete */
    app.route("/imap/delete/:imapId").delete(_auth2.default.requiresAdmin, _imap2.default.deleteImap);

    /* Route for fetch Imap Data */
    app.route("/imap/get").get(_auth2.default.requiresAdmin, _imap2.default.getImap);

    /* Route for imap get by id*/
    app.route("/imap/get/:imapId").get(_auth2.default.requiresAdmin, _imap2.default.getImapById);

    /* Route for fetch Imap Data */
    app.route("/imap/statusActive/:email").put(_auth2.default.requiresAdmin, _imap2.default.statusActive);

    app.param("imapId", _imap2.default.idResult);

    return app;
};
//# sourceMappingURL=imap.js.map
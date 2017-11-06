"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

var _candidate_device = require("../controllers/candidate_device");

var _candidate_device2 = _interopRequireDefault(_candidate_device);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for Token Verification  */
    app.route("/app_save_candidate_device").post(_candidate_device2.default.save);

    /*Route for Logout*/
    app.route("/candidate/logout").put(_candidate_device2.default.logout);

    /*Route for update mobile number*/
    app.route("/update/mobile").put(_candidate_device2.default.updateMobile);

    return app;
};
//# sourceMappingURL=candidate_device.js.map
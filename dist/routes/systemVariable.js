"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _systemVariable = require("../controllers/systemVariable");

var _systemVariable2 = _interopRequireDefault(_systemVariable);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    /* Route for List of Variable Template */
    app.route("/systemVariable/get/:page/:limit").get(_auth2.default.requiresAdminOrHr, _systemVariable2.default.variableList);

    return app;
};
//# sourceMappingURL=systemVariable.js.map
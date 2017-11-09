"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _emailVariable = require("../controllers/emailVariable");

var _emailVariable2 = _interopRequireDefault(_emailVariable);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for Template Variable Create  */
    app.route("/variable/add").post(_auth2.default.requiresAdminOrHr, _emailVariable2.default.create);

    /* Route for Template Variable update  */
    app.route("/variable/update/:variableId").put(_auth2.default.requiresAdminOrHr, _emailVariable2.default.update);

    /* Route for Template Variable Delete */
    app.route("/variable/delete/:variableId").delete(_auth2.default.requiresAdminOrHr, _emailVariable2.default.deleteVariable);

    /* Route for List of Variable Template */
    app.route("/variable/get/:page/:limit").get(_auth2.default.requiresAdminOrHr, _emailVariable2.default.variableList);

    /*variable get by id*/
    app.route("/variable/getById/:variableId").get(_auth2.default.requiresAdminOrHr, _emailVariable2.default.getVariableById);

    app.param("variableId", _emailVariable2.default.idResult);

    return app;
};
//# sourceMappingURL=emailVariable.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _template = require("../controllers/template");

var _template2 = _interopRequireDefault(_template);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for Template Create  */
    app.route("/template/add").post(_auth2.default.requiresAdminOrHr, _template2.default.create);

    /* Route for Template update  */
    app.route("/template/update/:templateId").put(_auth2.default.requiresAdminOrHr, _template2.default.update);

    /* Route for Template Delete */
    app.route("/template/delete/:templateId").delete(_auth2.default.requiresAdminOrHr, _template2.default.deleteTemplate);

    /* Route for List of Template */
    app.route("/template/get/:page/:limit").get(_auth2.default.requiresAdminOrHr, _template2.default.templateList);

    /* Route for TEST Template */
    app.route("/template/test/:templateId").get(_auth2.default.requiresAdminOrHr, _template2.default.templateTest);

    /* Route for Send Email Template */
    app.route("/template/email/:email").post(_auth2.default.requiresAdminOrHr, _template2.default.templateEmail);

    /*Route for get template by id*/
    app.route("/template/getById/:templateId").get(_auth2.default.requiresAdminOrHr, _template2.default.getTemplateById);

    app.param("templateId", _template2.default.idResult);

    return app;
};
//# sourceMappingURL=template.js.map
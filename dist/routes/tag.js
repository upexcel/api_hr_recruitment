"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _tag = require("../controllers/tag");

var _tag2 = _interopRequireDefault(_tag);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for tag save  */
    app.route("/tag/add/:type").post(_auth2.default.requiresAdminOrHr, _tag2.default.save);

    /* Route for tag update  */
    app.route("/tag/update/:type/:tagId").put(_auth2.default.requiresAdminOrHr, _tag2.default.update);

    /* Route for tag Delete */
    app.route("/tag/delete/:type/:tagId").delete(_auth2.default.requiresAdminOrHr, _tag2.default.deleteTag);

    /* Route for fetch tag Data */
    app.route("/tag/get/:type/:page/:limit").get(_auth2.default.requiresAdminOrHr, _tag2.default.getTag);

    /* Route for fetch all tag data */
    app.route("/tag/get").get(_auth2.default.requiresAdminOrHr, _tag2.default.getAllTag);

    /* Route for fetch tag by id */
    app.route("/tag/getbyid/:type/:tagId").get(_auth2.default.requiresAdminOrHr, _tag2.default.getTagById);

    /*Get shedules*/
    app.route("/get/shedule").get(_auth2.default.requiresAdminOrHr, _tag2.default.getShedule);

    /*set priority of job profile*/
    app.route("/update/priority").put(_auth2.default.requiresAdminOrHr, _tag2.default.updatePriority);

    app.param("tagId", _tag2.default.idResult);

    return app;
};
//# sourceMappingURL=tag.js.map
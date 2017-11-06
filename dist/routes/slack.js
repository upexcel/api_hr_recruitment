"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

var _slack = require("../controllers/slack");

var _slack2 = _interopRequireDefault(_slack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    /*Route for adding slack Information*/
    app.route("/add/slackInfo").post(_auth2.default.requiresAdmin, _slack2.default.addInfo);

    /*Route for getting channel list*/
    // app.route("/get/channelList/:account_id").get(auth.requiresAdmin, slack.getChannelList);

    /*Route for updating slack info*/
    app.route("/update/slackInfo/:account_id").put(_auth2.default.requiresAdmin, _slack2.default.update);

    /*Route for getting slack info*/
    app.route("/get/slackInfo").get(_auth2.default.requiresAdmin, _slack2.default.getSlackData);

    /*Route for getting slack info by id*/
    app.route("/get/slackInfoById/:slack_id").get(_auth2.default.requiresAdmin, _slack2.default.getSlackDataByid);

    /*Route for delete slack account*/
    app.route("/delete/slackInfo/:slack_id").delete(_auth2.default.requiresAdmin, _slack2.default.deleteSlackInfo);

    return app;
};
//# sourceMappingURL=slack.js.map
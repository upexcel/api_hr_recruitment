"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fetchEmail = require("../controllers/fetchEmail");

var _fetchEmail2 = _interopRequireDefault(_fetchEmail);

var _auth = require("../middleware/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {
    /* Route for fetch email from mongoDb  */
    app.route("/email/fetch/:tag_id/:page/:limit").put(_auth2.default.requiresLogin, _fetchEmail2.default.fetch);

    /* Route for add tag  */
    app.route("/email/assignTag/:tag_id/:mongo_id").put(_auth2.default.requiresLogin, _fetchEmail2.default.assignTag);

    /* Route for count emails on the basis of tag */
    app.route("/email/countEmail").get(_auth2.default.requiresLogin, _fetchEmail2.default.countEmail);

    /* Route for assign Multiple Tag  */
    app.route("/email/assignMultiple/:tag_id").put(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.assignMultiple);

    /* Route for delete Tag  */
    app.route("/email/deleteTag/:tag_id").delete(_auth2.default.requiresLogin, _fetchEmail2.default.deleteTag);

    /* Route for change unread status  */
    app.route("/email/changeUnreadStatus/:mongo_id/:status").put(_auth2.default.requiresLogin, _fetchEmail2.default.changeUnreadStatus);

    /* Route for delete email  */
    app.route("/email/deleteEmail/:tag_id").post(_auth2.default.requiresLogin, _fetchEmail2.default.deleteEmail);

    /* Route for save email attachment  */
    app.route("/email/mailAttachment/:mongo_id").put(_auth2.default.requiresLogin, _fetchEmail2.default.mailAttachment);

    /* fetch email by button */
    app.route("/email/fetchByButton").get(_auth2.default.requiresLogin, _fetchEmail2.default.fetchByButton);

    /*send mails to a list of emails*/
    app.route("/email/sendtomany").post(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.sendToMany);

    /*send to a specified Tag*/
    app.route("/email/send_to_selected_tag").put(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.sendToSelectedTag);

    /*get Candidate status*/
    app.route("/app_get_candidate").post(_fetchEmail2.default.app_get_candidate);

    /*getting email logs*/
    app.route("/get/email/logs/:page/:limit").get(_auth2.default.requiresAdmin, _fetchEmail2.default.logs);

    /*searching email logs*/
    app.route("/search/email/logs/:email/:page/:limit").get(_auth2.default.requiresAdmin, _fetchEmail2.default.searchLogs);

    /*Getting email status*/
    app.route("/get/emailStatus").put(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.emailStatus);

    /*getting email for last inputed dates*/
    app.route("/fetch/emails/:days").get(_auth2.default.requiresAdmin, _fetchEmail2.default.fetchByDates);

    /*send email to not replied candidate*/
    app.route("/sendToNotReplied").post(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.sendToNotReplied);

    /*send email by selection*/
    app.route("/email/by_seclection").post(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.sendBySelection);

    /*count of pending work*/
    app.route("/email/cron_status").post(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.cron_status);

    /*insert candidates notes*/
    app.route("/candidate_notes/insert").post(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.insert_note);

    /*update candidates notes*/
    app.route("/candidate_notes/update").post(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.update_note);

    /*Archive emails*/
    app.route("/email/archive").put(_auth2.default.requiresAdmin, _fetchEmail2.default.archiveEmails);

    /*Mark as unread*/
    app.route("/email/markAsUnread").put(_auth2.default.requiresAdminOrHr, _fetchEmail2.default.markAsUnread);

    /*Route for find emails by tagId*/
    app.param("tag_id", _fetchEmail2.default.findByTagId);

    return app;
};
//# sourceMappingURL=fetchMail.js.map
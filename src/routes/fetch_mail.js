import fetch_email from "../controllers/fetch_email";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for fetch email from mongoDb  */
    app.route("/email/fetch/:tag_id/:page/:limit").get(auth.requiresLogin, fetch_email.fetch);

    /* Route for add tag  */
    app.route("/email/assignTag/:tag_id/:mongo_id").put(auth.requiresLogin, fetch_email.assignTag);

    /* Route for count emails on the basis of tag */
    app.route("/email/countEmail").get(auth.requiresLogin, fetch_email.countEmail);

    /* Route for assign Multiple Tag  */
    app.route("/email/assignMultiple/:tag_id").put(auth.requiresLogin, fetch_email.assignMultiple);

    /* Route for delete Tag  */
    app.route("/email/deleteTag/:tag_id").delete(auth.requiresLogin, fetch_email.deleteTag);

    /* Route for change unread status  */
    app.route("/email/changeUnreadStatus/:mongo_id/:status").put(auth.requiresLogin, fetch_email.changeUnreadStatus);

    /* Route for delete email  */
    app.route("/email/deleteEmail").delete(auth.requiresLogin, fetch_email.deleteEmail);

    /* Route for save email attachment  */
    app.route("/email/mailAttachment/:mongo_id").put( fetch_email.mailAttachment);

    return app;
};

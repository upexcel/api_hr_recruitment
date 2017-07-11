import fetch_email from "../controllers/fetchEmail";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for fetch email from mongoDb  */
    app.route("/email/fetch/:tag_id/:page/:limit").put( /*auth.requiresLogin,*/ fetch_email.fetch);

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
    app.route("/email/deleteEmail/:tag_id").post(auth.requiresLogin, fetch_email.deleteEmail);

    /* Route for save email attachment  */
    app.route("/email/mailAttachment/:mongo_id").put(auth.requiresLogin, fetch_email.mailAttachment);

    /* fetch email by button */
    app.route("/email/fetchByButton").get(auth.requiresLogin, fetch_email.fetchByButton);

    /*send mails to a list of emails*/
    app.route("/email/sendtomany").post(auth.requiresLogin, fetch_email.sendToMany);

    /*Route for find emails by tagId*/
    app.param("tag_id", fetch_email.findByTagId)

    return app;
};

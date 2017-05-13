import fetch_email from "../controllers/fetch_email";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for fetch email from mongoDb  */
	app.route("/email/fetch").post(auth.requiresLogin, fetch_email.fetch);

    /* Route for add tag  */
	app.route("/email/assignTag").post(auth.requiresLogin, fetch_email.assignTag);

    /* Route for count emails on the basis of tag */
	app.route("/email/countEmail").post(fetch_email.countEmail);

    /* Route for assign Multiple Tag  */
	app.route("/email/assignMultiple").post(fetch_email.assignMultiple);

    /* Route for delete Tag  */
	app.route("/email/deleteTag").post(fetch_email.deleteTag);

    /* Route for change unread status  */
	app.route("/email/changeUnreadStatus").post(fetch_email.changeUnreadStatus);

	return app;
};

import fetch_email from "../controllers/fetch_email";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for imap save  */
	app.route("/email/fetch").post(auth.requiresLogin, fetch_email.fetch);
	app.route("/email/assignTag").post(fetch_email.assignTag);
	return app;
};
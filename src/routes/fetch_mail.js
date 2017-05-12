import fetch_email from "../controllers/fetch_email";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for fetch email from mongoDb  */
	app.route("/email/fetch").post(auth.requiresLogin, fetch_email.fetch);

	/* Route for add tag  */
	app.route("/email/assignTag").post(auth.requiresLogin, fetch_email.assignTag);

	/* Route for count emails on the basis of tag */
	app.route("/email/countEmail").post(auth.requiresLogin, fetch_email.countEmail);

	/* Route for assign Multiple Tag  */
	app.route("/email/assignMultiple").post(auth.requiresLogin, fetch_email.assignMultiple);

	/* Route for delete Tag  */
	app.route("/email/deleteTag").post(auth.requiresLogin, fetch_email.deleteTag);
	
	return app;
};

import fetch_email from "../controllers/fetch_email";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for fetch email from mongoDb  */
	app.route("/email/fetch").post(auth.requiresLogin, fetch_email.fetch);

	/* Route for add tag  */
	app.route("/email/assignTag").post(auth.requiresLogin, fetch_email.assignTag);
	
	return app;
};
import fetch_email from "../controllers/fetch_email";
import auth from "../middleware/auth";
// import baseController from '../controllers/BaseAPIController'

export default (app) => {
    /* Route for imap save  */
	app.route("/email/fetch").post(fetch_email.fetch);

	app.route("/email/assignTag").post(fetch_email.assignTag);

	app.route("/email/fetch_by_tag").post(fetch_email.fetch_by_tag);
	
	app.route("/email/count_email").post(fetch_email.count_email);
	return app;
};

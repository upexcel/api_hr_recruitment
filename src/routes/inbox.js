import inbox from "../controllers/inbox";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for get INBOX */
	app.route("/email/inbox/:page").get(auth.requiresLogin,inbox.getInbox);

    /* Route for fetch by UID*/
	app.route("/email/:uid").get(auth.requiresLogin,inbox.getUid);

	return app;
};

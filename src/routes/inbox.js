import inbox from "../controllers/inbox";

export default (app) => {
    /* Route for get INBOX */
	app.route("/email/inbox/:page/:limit").get( inbox.getInbox);

    /* Route for fetch by UID*/
    app.route("/email/:uid").get(inbox.getUid);

    return app;
};

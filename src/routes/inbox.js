import inbox from "../controllers/inbox";

export default (app) => {
    /* Route for get INBOX */
	app.route("/email/inbox/:page/:limit").get( inbox.getInbox);

	app.route("/email/inbox/:emailid").get( inbox.getByEmailId);

    /* Route for fetch by UID*/
  app.route("/email/:uid").get(inbox.getUid);

    return app;
};

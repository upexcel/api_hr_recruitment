import imap from "../controllers/imap";
import auth from "../middleware/auth";
// import baseController from '../controllers/BaseAPIController'

export default (app) => {
    /* Route for imap save  */
	app.route("/imap/save").post(auth.requiresAdmin, imap.save);

    /* Route for imap update  */
	app.route("/imap/update/:id").put(auth.requiresAdmin, imap.update);

    /* Route for imap Delete */
	app.route("/imap/delete/:id").delete(auth.requiresAdmin, imap.deleteImap);

    /* Route for fetch Imap Data*/
	app.route("/imap/get/:page").get(auth.requiresAdmin, imap.getImap);

	app.param("id", imap.idResult);

	return app;
};

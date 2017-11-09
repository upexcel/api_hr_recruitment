import imap from "../controllers/imap";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for imap save  */
    app.route("/imap/save").post(auth.requiresAdmin, imap.save);

    /* Route for imap update  */
    app.route("/imap/update/:imapId").put(auth.requiresAdmin, imap.update);

    /* Route for imap Delete */
    app.route("/imap/delete/:imapId").delete(auth.requiresAdmin, imap.deleteImap);

    /* Route for fetch Imap Data */
    app.route("/imap/get").get(auth.requiresAdmin, imap.getImap);

    /* Route for imap get by id*/
    app.route("/imap/get/:imapId").get(auth.requiresAdmin, imap.getImapById);

    /* Route for fetch Imap Data */
    app.route("/imap/statusActive/:email").put(auth.requiresAdmin, imap.statusActive);

    app.param("imapId", imap.idResult);

    return app;
};
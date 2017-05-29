import imap from "../controllers/imap";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for imap save  */
    app.route("/imap/save").post(auth.requiresAdmin, imap.save);

    /* Route for imap update  */
    app.route("/imap/update/:imap_id").put(auth.requiresAdmin, imap.update);

    /* Route for imap Delete */
    app.route("/imap/delete/:imap_id").delete(auth.requiresAdmin, imap.deleteImap);

    /* Route for fetch Imap Data */
    app.route("/imap/get/:page/:limit").get(auth.requiresAdmin, imap.getImap);

    /* Route for fetch Imap Data */
    app.route("/imap/statusActive/:email").put(imap.statusActive);

    app.param("imap_id", imap.idResult);

    return app;
};

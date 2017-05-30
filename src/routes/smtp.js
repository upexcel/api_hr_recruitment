import smtp from "../controllers/smtp";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for smtp save  */
    app.route("/smtp/save").post(auth.requiresAdmin, smtp.save);

    /* Route for smtp update  */
    app.route("/smtp/update/:smtpId").put(auth.requiresAdmin, smtp.update);

    /* Route for smtp Delete */
    app.route("/smtp/delete/:smtpId").delete(auth.requiresAdmin, smtp.deleteSmtp);

    /* Route for fetch smtp Data */
    app.route("/smtp/get/:page/:limit").get(auth.requiresAdmin, smtp.getSmtp);

    /* Route for fetch Smtp data by id */
    app.route("/smtp/getbyid/:smtpId").get(auth.requiresAdmin, smtp.getSmtpById);

    /* Route for  Smtp test */
    app.route("/smtp/testSmtp/:email").put(auth.requiresAdmin, smtp.testSmtp);

    /* Route for  change status */
    app.route("/smtp/changeStatus/:email").put(auth.requiresAdmin, smtp.changeStatus);

    app.param("smtpId", smtp.idResult);

    return app;
};

import smtp from "../controllers/smtp";
import auth from "../middleware/auth";
// import baseController from '../controllers/BaseAPIController'

export default (app) => {
    /* Route for smtp save  */
	app.route("/smtp/save").post(auth.requiresAdmin, smtp.save);

    /* Route for smtp update  */
	app.route("/smtp/update/:smtpId").put(auth.requiresAdmin, smtp.update);

    /* Route for smtp Delete */
	app.route("/smtp/delete/:smtpId").delete(auth.requiresAdmin, smtp.deleteSmtp);

    /* Route for fetch smtp Data*/
	app.route("/smtp/get/:page").get(smtp.getSmtp);

    /* Route for fetch Smtp data by id*/
	app.route("/smtp/getbyid/:smtpId").get(smtp.getSmtpById);

	app.param("smtpId", smtp.idResult);

	return app;
};

import template from "../controllers/template";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for Template Create  */
	app.route("/template/add").post( template.create);

    /* Route for Template update  */
	app.route("/template/update/:templateId").put( template.update);

    /* Route for Template Delete */
	app.route("/template/delete/:templateId").delete( template.deleteTemplate);

    /* Route for List of Template */
	app.route("/template/get/:page").get( template.templateList);

	return app;
};

import template from "../controllers/template";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for Template Create  */
	app.route("/template/add").post(auth.requiresLogin, template.create);

    /* Route for Template update  */
	app.route("/template/update/:templateId").put(auth.requiresLogin, template.update);

    /* Route for Template Delete */
	app.route("/template/delete/:templateId").delete(auth.requiresLogin, template.deleteTemplate);

    /* Route for List of Template */
	app.route("/template/list").get(auth.requiresLogin, template.templateList);

	return app;
};

import template from "../controllers/template";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for Template Create  */
    app.route("/template/add").post(auth.requiresAdminOrHr, template.create);

    /* Route for Template update  */
    app.route("/template/update/:templateId").put(auth.requiresAdminOrHr, template.update);

    /* Route for Template Delete */
    app.route("/template/delete/:templateId").delete(auth.requiresAdminOrHr, template.deleteTemplate);

    /* Route for List of Template */
    app.route("/template/get/:page").get(auth.requiresAdminOrHr, template.templateList);

    return app;
};

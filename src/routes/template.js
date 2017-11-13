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
    app.route("/template/get/:page/:limit").get(auth.requiresAdminOrHr, template.templateList);

    /* Route for TEST Template */
    app.route("/template/test/:templateId").get(auth.requiresAdminOrHr, template.templateTest);

    /* Route for Send Email Template */
    app.route("/template/email/:email").post(auth.requiresAdminOrHr, template.templateEmail);

    /*Route for get template by id*/
    app.route("/template/getById/:templateId").get(auth.requiresAdminOrHr, template.getTemplateById)

    app.param("templateId", template.idResult);

    return app;
};

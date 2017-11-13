import variable from "../controllers/emailVariable";
import auth from "../middleware/auth";

export default (app) => {
    /* Route for Template Variable Create  */
    app.route("/variable/add").post(auth.requiresAdminOrHr, variable.create);

    /* Route for Template Variable update  */
    app.route("/variable/update/:variableId").put(auth.requiresAdminOrHr, variable.update);

    /* Route for Template Variable Delete */
    app.route("/variable/delete/:variableId").delete(auth.requiresAdminOrHr, variable.deleteVariable);

    /* Route for List of Variable Template */
    app.route("/variable/get/:page/:limit").get(auth.requiresAdminOrHr, variable.variableList);

    /*variable get by id*/
    app.route("/variable/getById/:variableId").get(auth.requiresAdminOrHr, variable.getVariableById);

    app.param("variableId", variable.idResult);

    return app;
};

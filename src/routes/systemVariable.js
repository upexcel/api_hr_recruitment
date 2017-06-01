import systemVariable from "../controllers/systemVariable";
import auth from "../middleware/auth";

export default (app) => {

    /* Route for List of Variable Template */
    app.route("/systemVariable/get/:page/:limit").get(auth.requiresAdminOrHr, systemVariable.variableList);

    return app;
};

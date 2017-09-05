import auth from "../middleware/auth";
import dashboard from "../controllers/dashboard";

export default (app) => {

    app.route("/dashboard").get(dashboard.getDashboard);


    return app;
};
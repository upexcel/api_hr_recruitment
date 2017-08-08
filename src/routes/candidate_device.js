import auth from "../middleware/auth";
import device from "../controllers/candidate_device";

export default (app) => {
    /* Route for Token Verification  */
    app.route("/app_save_candidate_device").post(device.save);

    /*Route for Logout*/
    app.route("/candidate/logout").put(device.logout)

    return app;
};
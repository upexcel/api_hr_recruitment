import account from "../controllers/account";
import auth from "../middleware/auth";

export default (app) => {

    /* Route for Forgot Password */
    app.route("/account/forgot_password/:email").put(account.forgot_password);

    /* Route for Update Password */
    app.route("/account/update_password").put(auth.requiresLogin, account.update_password);

    return app;
};
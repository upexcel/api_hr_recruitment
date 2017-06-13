import account from "../controllers/account";

export default (app) => {

    /* Route for Forgot Password */
    app.route("/account/forgot_password/:email").put(account.forgot_password);

    /* Route for Update Password */
    app.route("/account/update_password/:email").put(account.update_password);

    return app;
};

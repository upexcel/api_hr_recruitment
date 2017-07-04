import auth from "../middleware/auth";
import user from "../controllers/user";

export default (app) => {
    /* Route for Token Verification  */
    app.route("/verify").get(auth.verifyToken);

    /* Route for User Registration  */
    app.route("/user/register").post(user.create);

    /* Route for User Login  */
    app.route("/user/login").post(user.login);

    return app;
};

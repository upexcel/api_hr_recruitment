import auth from "../middleware/auth";
import user from "../controllers/user";

export default (app) => {
    /* Route for Token Verification  */
    app.route("/verify").get(auth.verifyToken);

    /* Route for User Registration  */
    app.route("/user/add_user").post(auth.requiresAdmin, user.create);

    /* Route for User Login  */
    app.route("/user/login").post(user.login);

    /* Route for user list*/
    app.route("/user/list/:page/:limit").get(auth.requiresAdmin, user.list);

    /*Route for delete user only by admin*/
    app.route("/user/delete/:id").delete(auth.requiresAdmin, user.deleteUser);

    app.route("/user/log/:email_id").get(auth.requiresAdmin, user.logs);

    app.param("id", user.idResult)

    return app;
};
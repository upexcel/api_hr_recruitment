import auth from "../middleware/auth";

export default (app) => {
    /* Route for Token Verification  */
    app.route("/verify").get(auth.verifyToken);

    return app;
};

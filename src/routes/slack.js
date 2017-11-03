import auth from "../middleware/auth";
import slack from "../controllers/slack";

export default (app) => {

    /*Route for adding slack Information*/
    app.route("/add/slackInfo").post(auth.requiresAdmin, slack.addInfo);

    /*Route for getting channel list*/
    app.route("/get/channelList/:account_id").get(auth.requiresAdmin, slack.getChannelList);

    /*Route for updating slack info*/
    app.route("/update/slackInfo/:account_id").put(auth.requiresAdmin, slack.update);

    return app;
};
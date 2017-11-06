import auth from "../middleware/auth";
import slack from "../controllers/slack";

export default (app) => {

    /*Route for adding slack Information*/
    app.route("/add/slackInfo").post(auth.requiresAdmin, slack.addInfo);

    /*Route for getting channel list*/
    // app.route("/get/channelList/:account_id").get(auth.requiresAdmin, slack.getChannelList);

    /*Route for updating slack info*/
    app.route("/update/slackInfo/:account_id").put(auth.requiresAdmin, slack.update);

    /*Route for getting slack info*/
    app.route("/get/slackInfo").get(auth.requiresAdmin, slack.getSlackData);

    /*Route for getting slack info by id*/
    app.route("/get/slackInfoById/:slack_id").get(auth.requiresAdmin, slack.getSlackDataByid); 
    
    /*Route for delete slack account*/
    app.route("/delete/slackInfo/:slack_id").delete(auth.requiresAdmin, slack.deleteSlackInfo);   

    return app;
};
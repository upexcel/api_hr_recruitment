var inbox = require("../inbox");
var CronJob = require("cron").CronJob;

export class CronController {
    cron(email) {
        // new CronJob("*/15 * * * *", function() {
        //     inbox.fetchEmail(email); // running this function every 15 min
            inbox.beforeDateEmail(email);
        // }, null, true);
    }
}
const controller = new CronController();
export default controller;

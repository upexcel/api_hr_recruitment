var inbox = require("../inbox");
var CronJob = require("cron").CronJob;

export class CronController {
    cron(email) {
        new CronJob("*/5 * * * *", function() { // running Cron every 30 min
            inbox.fetchEmail(email);
            inbox.beforeDateEmail(email);
        }, null, true);

    }
}
const controller = new CronController();
export default controller;

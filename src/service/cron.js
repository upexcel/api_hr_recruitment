var inbox = require("../inbox");
var CronJob = require("cron").CronJob;

export class CronController {
    cron(email) {
        new CronJob("*/15 * * * *", function() {
            inbox.fetch_email(email); // running this function every 15 min
        }, null, true);
    }
}
const controller = new CronController();
export default controller;

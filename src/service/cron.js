var inbox = require("../inbox");
var CronJob = require("cron").CronJob;

export class CronController {
    cron(email) {
        new CronJob("*/60 * * * *", function() {
            inbox.fetchEmail(email) // running this function every 60 min
                .then((response) => {
                    inbox.beforeDateEmail(email);
                });
        }, null, true);
    }
}
const controller = new CronController();
export default controller;
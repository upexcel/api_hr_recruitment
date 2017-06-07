var inbox = require("../inbox");
var CronJob = require("cron").CronJob;

export class CronController {
    cron(email) {
<<<<<<< HEAD

        // new CronJob("*/1 * * * *", function() {
        inbox.fetchEmail(email); // running this function every 15 min
        // inbox.beforeDateEmail(email);
        // }, null, true);
=======
        new CronJob("*/5 * * * *", function() {
            inbox.fetchEmail(email); // running this function every 15 min
            inbox.beforeDateEmail(email);
        }, null, true);
>>>>>>> c578ce5f05f69af4c47f71d1047ef80f3ca6a213
    }
}
const controller = new CronController();
export default controller;

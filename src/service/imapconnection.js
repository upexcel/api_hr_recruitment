var Imap = require("imap");
export class imapConnectionController {
    imapConnection(imap, callback) {
        function openInbox(cb) {
            imap.openBox("INBOX", true, cb);
        }
        imap.once("ready", function() {
            openInbox(function(err, box) {
                if (err) {
                    callback(err);
                } else {
                    callback("", box);
                }
                imap.end();
            });
        });
        imap.once("error", function(err) {
            callback(err);
        });
        imap.once("end", function() {
            console.log("Connection ended");
        });
        imap.connect();
    }
}
const controller = new imapConnectionController();
export default controller;

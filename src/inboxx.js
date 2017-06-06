var Imap = require("imap");
var MailParser = require("mailparser").MailParser;
var Promise = require("bluebird");
Promise.longStackTraces();

var imapConfig = {
    user: 'vaibhav_pathak@excellencetechnologies.in',
    password: 'VAibhav@1994',
    host: 'imap.gmail.com',
    port: 993,
    tls: true
};

var imap = new Imap(imapConfig);
Promise.promisifyAll(imap);

imap.once("ready", execute);
imap.once("error", function(err) {
    log.error("Connection error: " + err.stack);
});

imap.connect();

function execute() {
    imap.openBox("INBOX", false, function(err, mailBox) {
        if (err) {
            console.error(err);
            return;
        }
        imap.search(["UNSEEN", ["SINCE", "May 31, 2017"]], function(err, results) {
            // if (!results || !results.length) {
            //     console.log("No unread mails");
            //     imap.end();
            //     return;
            // }

            var f = imap.fetch("*", { bodies: "" });
            f.on("message", processMessage);
            f.once("error", function(err) {
                return Promise.reject(err);
            });
            f.once("end", function() {
                console.log("Done fetching all unseen messages.");
                imap.end();
            });
        });
    });
}


function processMessage(msg, seqno) {
    // console.log("Processing msg #" + seqno);

    var parser = new MailParser();

    parser.on('data', data => {
        if (data.type === 'text') {
            // console.log(seqno);
            // console.log(data.text);
        }
    });
    var headers = {};
    var bodyMsg = "";
    var buffer;
    msg.on("body", function(stream) {
        stream.on("data", function(chunk) {
            parser.write(chunk.toString("utf8"));
            buffer += chunk.toString("utf8");
        });
        stream.once("end", function() {
            headers = Imap.parseHeader(buffer);

        });
    });



    msg.once("end", function() {
        parser.end();
    });
}

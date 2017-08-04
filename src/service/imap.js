import Imap from "imap";

export class imapConnection {
    imapConnection(imap) {
        return new Promise((resolve, reject) => {
            function openInbox(cb) {
                imap.openBox("INBOX", true, cb);
            }
            imap.once("ready", function() {
                openInbox(function(err, box) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(box);
                    }
                });
            });
            imap.once("error", function(err) {
                reject(err);
            });
            imap.once("end", function() {
                console.log("Connection ended");
            });
            imap.connect();
        });

    }
    imapCredential(data) {
        return new Promise((resolve, reject) => {
            var imap = new Imap({
                user: data.dataValues.email,
                password: data.dataValues.password,
                host: "imap.gmail.com",
                port: 993,
                tls: "TLS",
            });
            resolve(imap);
        });
    }
}
const imap = new imapConnection();
export default imap;
import db from "../db"
import path from "path";
import fs from "fs";
import base64 from "base64-stream";
import config from "../config.json";
import google from "googleapis";
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);
oauth2Client.setCredentials({
    access_token: config.access_token,
    token_type: config.token_type,
    expires_in: config.expires_in,
    refresh_token: config.refresh_token
});
var drive = google.drive({
    version: "v2",
    auth: oauth2Client
});

var self = module.exports = {
    getAttachment: function(imap, uid) {
        return new Promise((resolve, reject) => {
            function openInbox(cb) {
                imap.openBox("INBOX", true, cb);
            }
            imap.once("ready", () => {
                openInbox(() => {
                    var f = imap.fetch(uid, {
                        bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
                        struct: true
                    });
                    f.on("message", (msg, seqno) => {
                        var prefix = "(#" + seqno + ") ";
                        msg.once("attributes", (attrs) => {
                            var attachments = self.findAttachmentParts(attrs.struct);
                            var len = attachments.length,
                                uid = attrs.uid,
                                flag = attrs.flags;
                            for (var i = 0; i < len; ++i) {
                                var attachment = attachments[i];
                                var f = imap.fetch(attrs.uid, {
                                    bodies: [attachment.partID],
                                    struct: true
                                });
                            }
                            if (attachments[0] == null) {
                                resolve(attachments);
                            } else {
                                f.on("message", self.buildAttMessageFunction(attachment, uid, flag, (err, response) => {
                                       if(err){
                                    reject(err);    
                                }else{
                                    resolve(response);
                                }
                                }))
                            }
                        });
                        msg.once("end", () => {
                            console.log(prefix + "Finished");
                        });
                    });
                    f.once("error", (err) => {
                        reject("Fetch error: " + err);
                    });
                    f.once("end", () => {
                        console.log("Done fetching all messages!");
                        imap.end();
                    });
                });
            });
            imap.once("error", (err) => {
                reject(err);
            });
            imap.once("end", () => {
                console.log("Connection ended");
            });
            imap.connect();
        })

    },
    findAttachmentParts: function(struct, attachments) {
        attachments = attachments || [];
        var len = struct.length;
        for (var i = 0; i < len; ++i) {
            if (Array.isArray(struct[i])) {
                self.findAttachmentParts(struct[i], attachments);
            } else if (struct[i].disposition && ["INLINE", "ATTACHMENT"].indexOf(struct[i].disposition.type) > 0) {
                attachments.push(struct[i]);
            }
        }
        return attachments;
    },
    buildAttMessageFunction: function(attachment, uid, flag, callback) {
        var filename = attachment.disposition.params.filename;
        var encoding = attachment.encoding;
        var filepath = path.join(__dirname, "/uploads/", filename);
        return (msg, seqno) => {
            var prefix = "(#" + seqno + ") ";
            msg.on("body", (stream) => {
                var writeStream = fs.createWriteStream(filepath);
                if (encoding === "BASE64") {
                    stream.pipe(base64.decode()).pipe(writeStream);
                } else {
                    stream.pipe(writeStream);
                }
                fs.readFile(filepath, {
                    encoding: "utf8"
                }, (error, data) => {
                    var fileMetadata = {
                        title: filename
                    };
                    var media = {
                        body: data
                    };
                    drive.files.insert({
                        resource: fileMetadata,
                        media: media,
                        fields: "id"
                    }, (err, file) => {
                        if (!err) {
                            var attachment_file = [{
                                name: attachment.disposition.params.filename,
                                link: "https://drive.google.com/file/d/" + file.id + "/view"
                            }];
                            callback('', attachment_file);
                        } else {
                            callback(err);
                        }
                    });
                });
                fs.unlink(filepath, () => {
                    console.log("success");
                });
            });
            msg.once("end", () => {
                console.log(prefix + "Finished attachment %s", filename);
            });
        };
    }
}

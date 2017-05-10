var cron = require("node-cron"),
	mongoose = require("mongoose"),
	conn = mongoose.connect("mongodb://localhost/EMAILPANEL"),
	in_array = require("in_array"),
	fs = require("fs"),
	base64 = require("base64-stream"),
	path = require("path"),
	multer = require("multer"),
	google = require("googleapis"),
	OAuth2 = google.auth.OAuth2,
	upload = multer({
		dest: "uploads/"
	}),
	Imap = require("imap");
var db = require("./mongodb/fetch"),
	email = conn.model("EMAIL", emailSchema);
var config = require("./src/config.json");
var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);
oauth2Client.setCredentials({
	access_token: config.access_token,
	token_type: config.token_type,
	expires_in: config.expires_in,
	refresh_token: config.refresh_token,
});
var drive = google.drive({ version: "v2", auth: oauth2Client });
var imap = new Imap({
	user: "vaibhav_pathak@excellencetechnologies.in",
	password: "VAibhav@1994",
	host: "imap.gmail.com",
	port: 993,
	tls: true
});

function openInbox(cb) {
	imap.openBox("INBOX", true, cb);
}
var headers = {},
	bodyMsg = "";
imap.once("ready", function() {
	openInbox(function(err, box) {
        // this will fetch all the Emails data from Gmail
		var f = imap.seq.fetch("1:10000000", {
			bodies: ["HEADER.FIELDS (FROM TO SUBJECT BCC CC DATE)", "TEXT"],
			struct: true,
		});
		f.on("message", function(msg, seqno) {
			var textmsg = "";
			var prefix = "(#" + seqno + ") ";
			msg.on("body", function(stream, info) {
				var buffer = "";
				stream.on("data", function(chunk) {
					buffer += chunk.toString("utf8");
				});
				stream.once("end", function() {
					headers = Imap.parseHeader(buffer);
					var hash = buffer.substring(buffer.indexOf("<div")),
						textmsg = hash.substring(0, hash.lastIndexOf("</div>"));
					if (textmsg !== "") {
						bodyMsg = textmsg + "</div>";
					}
				});
			});
			msg.once("attributes", function(attrs) {
				var attachments = findAttachmentParts(attrs.struct);
				var len = attachments.length,
					uid = attrs.uid,
					flag = attrs.flags;
				for (var i = 0; i < len; ++i) {
					var attachment = attachments[i];
					var f = imap.fetch(attrs.uid, {
						bodies: [attachment.partID],
						struct: true,
					});
				}
				if (attachments[0] == null) {
					database_save(attachments, uid, flag, bodyMsg, seqno);
				} else {
					f.on("message", buildAttMessageFunction(attachment, uid, flag, bodyMsg, seqno));
                    // buildAttMessageFunction(attachment, uid, flag, bodyMsg, seqno)
				}
			});
			msg.once("end", function() {
				console.log(prefix + "Finished");
			});
		});
		f.once("error", function(err) {
			console.log("Fetch error: " + err);
		});
		f.once("end", function() {
			console.log("Done fetching all messages!");
			imap.end();
		});
	});
});

function findAttachmentParts(struct, attachments) {
	attachments = attachments || [];
	var len = struct.length;
	for (var i = 0; i < len; ++i) {
		if (Array.isArray(struct[i])) {
			findAttachmentParts(struct[i], attachments);
		} else {
			if (struct[i].disposition && ["INLINE", "ATTACHMENT"].indexOf(struct[i].disposition.type) > 0) {
				attachments.push(struct[i]);
			}
		}
	}
	return attachments;
}

function buildAttMessageFunction(attachment, uid, flag, bodyMsg, seqno) {
	var filename = attachment.params.name;
	var encoding = attachment.encoding;
	var filepath = path.join(__dirname, "/./uploads/", filename);
    //This example uploads a plain text file to Google Drive with the title "filename" and contents "Hello World".
	return function(msg, seqno) {
		var prefix = "(#" + seqno + ") ";
		msg.on("body", function(stream, info) {
			var writeStream = fs.createWriteStream(filepath);
			writeStream.on("finish", function() {
				fs.readFile(filename, { encoding: "utf8" }, function(error, data) {});
			});
			if (encoding === "BASE64") {
				stream.pipe(base64.decode()).pipe(writeStream);
			} else {
				stream.pipe(writeStream);
			}
			fs.readFile(filepath, { encoding: "utf8" }, function(error, data) {
				var fileMetadata = {
					"title": filename,
					mimeType: "text/javascript/html/csv"
				};
				var media = {
					mimeType: "text/javascript/html/csv",
					body: data
				};
				drive.files.insert({
					resource: fileMetadata,
					media: media,
					fields: "id"
				}, function(err, file) {
					if (!err) {
						attachment_file = [{ "name": attachment.params.name, "link": "https://drive.google.com/file/d/" + file.id + "/view" }];
						database_save(attachment_file, uid, flag, bodyMsg, seqno);
						console.log("=======================================");
						console.log("file is saved");
						console.log("========================================");
					} else {
						console.log(err);
					}
				});

			});
			fs.unlink(filepath, function(err) { console.log("success"); });
		});
		msg.once("end", function() {
			console.log(prefix + "Finished attachment %s", filename);
		});
	};
}


function database_save(attachments, uid, flag, bodyMsg, seqno) {
	var emailid = seqno,
		to = headers.to.toString();
	var hash1 = headers.from.toString().substring(headers.from.toString().indexOf("\"")),
		from = hash1.substring(0, hash1.lastIndexOf("<"));
	var hash = headers.from.toString().substring(headers.from.toString().indexOf("<") + 1),
		sender_mail = hash.substring(0, hash.lastIndexOf(">"));
	var date = headers.date.toString(),
		email_date = new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1) + "-" + new Date(date).getDate(),
		email_timestamp = new Date(date).getTime(),
		subject = headers.subject.toString(),
		uid = uid,
		unread = in_array("[]", flag),
		answered = in_array("\\Answered", flag),
		message = bodyMsg,
		attachment = attachments;

	var detail = new email({
		"email_id": emailid,
		"to": to,
		"from": from,
		"sender_mail": sender_mail,
		"date": date,
		"email_date": email_date,
		"email_timestamp": email_timestamp,
		"subject": subject,
		"uid": uid,
		"unread": unread,
		"answered": answered,
		"body": message,
		"attachment": attachment,
	});
	detail.save(function(err, detail) {
		if (err) {
			console.log("Duplicate Data");
		} else {
			console.log("++++++++++++++++++++++++++++++++++++");
			console.log("data saved successfully");
			console.log("++++++++++++++++++++++++++++++++++++");
		}
	});
}
imap.once("error", function(err) {
	console.log(err);
});
imap.once("end", function() {
	console.log("Connection ended");
});
imap.connect();

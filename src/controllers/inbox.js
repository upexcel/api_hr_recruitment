import BaseAPIController from "./BaseAPIController";

export class InboxController extends BaseAPIController {
    /* Get INBOX data*/
    getInbox = (req, res, next) => {
        req.email.find().skip((req.params.page - 1) * parseInt(req.params.limit)).limit(parseInt(req.params.limit)).exec((err, data) => {
            if (err) {
                next(new Error("invalid page"));
            } else {
                res.json({
                    data
                });
            }
        });
    }

    /* Get Emails By EmailId*/
    getByEmailId = (req, res, next) => {
        req.email.find({
            sender_mail: req.params.emailid
        }).sort({
            uid: 'desc'
        }).exec((err, data) => {
            if (err) {
                next(new Error(" Invalid Email Id"));
            } else {
                res.json({
                    data
                });
            }
        });
    }


    /* Get UID data*/
    getUid = (req, res, next) => {
        req.email.findOne({
            uid: parseInt(req.params.uid)
        }).exec((err, data) => {
            if (err) {
                next(new Error("invalid UID"));
            } else {
                res.json({
                    data
                });
            }
        });
    }
}

const controller = new InboxController();
export default controller;

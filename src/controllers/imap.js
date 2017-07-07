import Imap from "imap";
import BaseAPIController from "./BaseAPIController";
import ImapProvider from "../providers/ImapProvider";
import imap from "../service/imap";

export class ImapController extends BaseAPIController {

    /* Controller for Save Imap Data  */
    save = (req, res) => {
        ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((dataValues) => {
                var tag = {
                    dataValues: {
                        email: dataValues.email,
                        password: dataValues.password
                    }
                }
                imap.imapCredential(tag)
                    .then((imapCredential) => {
                        imap.imapConnection(imapCredential)
                            .then((connection) => {
                                this._db.Imap.create(dataValues)
                                    .then((data) => {
                                        res.json({
                                            data
                                        })
                                    }, (err) => {
                                        throw new Error(res.json(400, {
                                            message: err
                                        }));
                                    }, (err) => {
                                        throw new Error(res.json(400, { message: err }))
                                    })
                            }, (err) => {
                                throw new Error(res.json(400, { message: "Invalid Details" }))
                            })

                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap data Update */
    update = (req, res) => {
        ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Imap.update(data, {
                        where: {
                            id: req.params.imapId
                        }
                    })
                    .then((docs) => {
                        this.handleSuccessResponse(res, null);
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap data delete */
    deleteImap = (req, res) => {
        this._db.Imap.destroy({
                where: {
                    id: req.params.imapId
                }
            })
            .then((docs) => {
                this.handleSuccessResponse(res, null);
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Imap data */
    getImap = (req, res) => {
        var result = []
        this._db.Imap.findAll({ order: '`id` DESC' })
            .then((response) => {
                var imap_emails = response;
                findCount(imap_emails, function(data) {
                    res.json(result)
                })

                function findCount(emails, callback) {
                    var imap_data = "";
                    var imap_email = emails.splice(0, 1)[0]
                    req.email.find({ imap_email: imap_email.email }).count().exec(function(err, data) {
                        imap_data = {
                            active: imap_email.active,
                            createdAt: imap_email.createdAt,
                            email: imap_email.email,
                            id: imap_email.id,
                            imap_server: imap_email.imap_server,
                            password: imap_email.password,
                            server_port: imap_email.port,
                            status: imap_email.status,
                            type: imap_email.type,
                            updatedAt: imap_email.updatedAt,
                            fetched_email_count: data
                        }
                        result.push(imap_data)
                        if (emails.length) {
                            findCount(emails, callback)
                        } else {
                            callback(result)
                        }
                    })
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap Active  Status */
    statusActive = (req, res, next) => {
        this._db.Imap.imapTest(req.params.email)
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Imapp data using id */
    idResult = (req, res, next, imapId) => {
        this.getById(req, res, this._db.Imap, imapId, next);
    }
}


const controller = new ImapController();
export default controller;

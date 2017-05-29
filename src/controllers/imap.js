import Imap from "imap";
import BaseAPIController from "./BaseAPIController";
import ImapProvider from "../providers/ImapProvider";

export class ImapController extends BaseAPIController {

    /* Controller for Save Imap Data  */
    save = (req, res) => {
        ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Imap.create(data)
                    .then((data) => {
                        res.json({
                            data
                        })
                    }, (err) => {
                        throw new Error(res.json(400, {
                            error: err
                        }));
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
        this._db.Imap.findAll({
                offset: (req.params.page - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit)
            })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Imapp data using id */
    idResult = (req, res, next, imapId) => {
        this.getById(req, res, this._db.Imap, imapId, next);
    }


    /* Imap Active  Status */
    statusActive = (req, res) => {
        ImapProvider.statusActive(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then(() => {
                this._db.Imap.findOne({
                        where: {
                            email: req.body.email
                        }
                    })
                    .then((result) => {
                        if (result) {
                            let imap = new Imap({
                                user: result.email,
                                password: result.password,
                                host: result.imap_server,
                                port: result.server_port,
                                tls: result.type
                            });
                            imap_connection(imap, (err) => {
                                if (err) {
                                    throw new Error(res.json(400, {
                                        error: err
                                    }));
                                } else {
                                    this._db.Imap.update({
                                            status: "FALSE"
                                        }, {
                                            where: {
                                                email: req.body.email
                                            }
                                        })
                                        .then((data) => {
                                            if (data[0] == 1) {
                                                this.handleSuccessResponse(res, null);
                                            } else {
                                                throw new Error(res.json(400, {
                                                    error: "User Not Found In Db"
                                                }));
                                            }
                                        }, (err) => {
                                            throw new Error(res.json(400, {
                                                error: err
                                            }));
                                        })
                                }
                            });
                        } else {
                            throw new Error(res.json(400, {
                                error: "Email Not Found In DB"
                            }));
                        }
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }

}

function imap_connection(imap, callback) {
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

const controller = new ImapController();
export default controller;

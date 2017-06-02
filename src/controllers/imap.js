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
                            message: err
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
        this._db.Imap.findAll({ offset: (req.params.page - 1) * parseInt(req.params.limit), limit: parseInt(req.params.limit) })
            .then(res.json.bind(res))
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

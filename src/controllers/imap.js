import BaseAPIController from "./BaseAPIController";
import ImapProvider from "../providers/ImapProvider";

export class ImapController extends BaseAPIController {
    /* Controller for Save Imap Data  */

    save = (req, res) => {
        ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Imap.create(data)
                    .then(res.json.bind(res))
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Imapp data using id */
    idResult = (req, res, next, id) => {
        this.getById(req, res, this._db.Imap, id, next);
    }

    /* Imap data Update */
    update = (req, res) => {
        ImapProvider.save(this._db.Imap, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Imap.update(data, { where: { id: req.params.id } })
                    .then((data) => {
                        if (data[0]) {
                            this.handleSuccessResponse(res, null);
                        } else {
                            this.handleErrorResponse(res, "data not deleted");
                        }
                    })
                    .catch(this.handleErrorResponse.bind(null, res));
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap data delete */

    deleteImap = (req, res) => {
        this._db.Imap.destroy({ where: { id: req.params.id } })
            .then((data) => {
                if (data) {
                    this.handleSuccessResponse(res, null);
                } else {
                    this.handleErrorResponse(res, "data not deleted");
                }
            })
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get Imap data */
    getImap = (req, res) => {
        this._db.Imap.findAll({ offset: (req.params.page - 1) * 10, limit: 10 })
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }
}

const controller = new ImapController();
export default controller;

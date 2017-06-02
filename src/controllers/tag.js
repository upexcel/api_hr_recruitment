import BaseAPIController from "./BaseAPIController";
import TagProvider from "../providers/TagProvider";
import tag from "../models/constant";

export class ImapController extends BaseAPIController {
    /* Controller for Save Imap Data  */
    save = (req, res) => {
        TagProvider.save(this._db, req.params.type, req.checkBody, req.body, req.getValidationResult())
            .then((tag) => {
                this._db.Tag.create(tag)
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


    /* Imap data Update*/
    update = (req, res) => {
        TagProvider.save(this._db.Imap, req.params.type, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Tag.update(data, {
                        where: {
                            id: req.params.tagId,
                            type: req.params.type
                        }
                    })
                    .then((docs) => {
                        this.handleSuccessResponse(res, null);
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap data delete */

    deleteTag = (req, res, next) => {
        if (req.params.type == tag().tagType.automatic || req.params.type == tag().tagType.manual) {
            this._db.Tag.destroy({
                    where: {
                        id: req.params.tagId,
                        type: req.params.type
                    }
                })
                .then((docs) => {
                    this.handleSuccessResponse(res, null);
                }).catch(this.handleErrorResponse.bind(null, res));
        } else {
            next(new Error("Invalid Type"));
        }
    }

    /* Get Imap data */
    getTag = (req, res, next) => {
        if (req.params.type == tag().tagType.automatic || req.params.type == tag().tagType.manual || req.params.type == tag().tagType.default) {
            this._db.Tag.findAll({
                    offset: (req.params.page - 1) * parseInt(req.params.limit),
                    limit: parseInt(req.params.limit),
                    where: {
                        type: req.params.type
                    }
                })
                .then(res.json.bind(res))
                .catch(this.handleErrorResponse.bind(null, res));
        } else {
            next(new Error("Invalid Type"));
        }
    }

    /* Get all tag */
    getAllTag = (req, res) => {
        this._db.Tag.findAll()
            .then(res.json.bind(res))
            .catch(this.handleErrorResponse.bind(null, res));
    }

    /* Get tag by id */
    getTagById = (req, res, next) => {
        if (req.params.type == tag().tagType.automatic || req.params.type == tag().tagType.manual || req.params.type == tag().tagType.default) {
            this._db.Tag.findOne({
                    where: {
                        id: req.result.id,
                        type: req.params.type
                    }
                })
                .then(res.json.bind(res))
                .catch(this.handleErrorResponse.bind(null, res));
        } else {
            next(new Error("Invalid Type"));
        }
    }

    /* Get Imap data using id*/
    idResult = (req, res, next, tagId) => {
        this.getById(req, res, this._db.Tag, tagId, next);
    }

}

const controller = new ImapController();
export default controller;

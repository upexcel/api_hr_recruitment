import BaseAPIController from "./BaseAPIController";
import TagProvider from "../providers/TagProvider";
import tag from "../models/constant";

export class ImapController extends BaseAPIController {
    /* Controller for Save Imap Data  */
    save = (req, res) => {
        var assign = req.body.assign;
        TagProvider.save(this._db, req.params.type, req.checkBody, req.body, req.getValidationResult())
            .then((response) => {
                this._db.Tag.create(response)
                    .then((data) => {
                        if (data) {
                            if ((data.type == tag().tagType.automatic) && (assign === true)) {
                                this._db.Tag.assignTag(data, req.email)
                                    .then((response) => {
                                        req.email.update({
                                                _id: { $in: response }
                                            }, {
                                                "$addToSet": {
                                                    "tag_id": data.id.toString()
                                                },
                                                "email_timestamp": new Date().getTime()
                                            }, {
                                                multi: true
                                            })
                                            .then((data1) => {
                                                res.json({ message: "tag assigned sucessfully", data: data })
                                            })
                                    }, (err) => {
                                        throw new Error(res.json(400, {
                                            message: err
                                        }))
                                    });
                            } else {
                                res.json(data)
                            }
                        } else {
                            res.status(500).send({ message: "Tag is not Added" })
                        }
                    }, (err) => {
                        res.status(500).json({ message: err })
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
                    if (docs) {
                        req.email.update({ tag_id: { $all: [req.params.tagId] } }, { $pull: { tag_id: req.params.tagId } }, { multi: true })
                            .then((data) => {
                                this.handleSuccessResponse(res, null);
                            })
                            .catch(this.handleErrorResponse.bind(null, res));
                    } else {
                        next(res.status(400).send({ message: "Invalid tagId" }));
                    }
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
                    },
                    order: '`id` DESC'
                })
                .then(res.json.bind(res))
                .catch(this.handleErrorResponse.bind(null, res));
        } else {
            next(new Error("Invalid Type"));
        }
    }

    /* Get all tag */
    getAllTag = (req, res) => {
        this._db.Tag.findAll({ order: '`id` DESC' })
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

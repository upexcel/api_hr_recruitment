import BaseAPIController from "./BaseAPIController";
import TagProvider from "../providers/TagProvider";
import tag from "../models/constant";
import _ from 'lodash';
import moment from 'moment';
import constant from "../models/constant";
import email_process from "../mongodb/emailprocess";

export class TagController extends BaseAPIController {
    /* Controller for Save Imap Data  */
    save = (req, res, next) => {
        var assign = req.body.assign;
        TagProvider.save(this._db, req.params.type, req.checkBody, req.body, req.getValidationResult())
            .then((response) => {
                response.parent_id = (response.parent_id) ? parseInt(response.parent_id) : 0;
                this._db.Tag.create(response)
                    .then((data) => {
                        if (data) {
                            if ((data.type == tag().tagType.automatic) && (assign === true)) {
                                email_process.assignToOldTag(data, req.email)
                                    .then((result) => { this.handleSuccessResponse(req, res, next, result) })
                            } else if ((data.type == tag().tagType.default)) {
                                email_process.assignToNewTag(data, req.email)
                                    .then((result) => { this.handleSuccessResponse(req, res, next, result) })
                            } else {
                                this.handleSuccessResponse(req, res, next, data)
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
    update = (req, res, next) => {
        let assign = req.body.assign_to_all_emails;
        TagProvider.save(this._db.Imap, req.params.type, req.checkBody, req.body, req.getValidationResult())
            .then((data) => {
                this._db.Tag.update(data, {
                        where: {
                            id: req.params.tagId,
                            type: req.params.type
                        }
                    })
                    .then((docs) => {
                        if (assign) {
                            this._db.Tag.assignTagDuringUpdate(req.params.tagId, req).then((response) => {
                                this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                            })
                        } else {
                            this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                        }
                    })
            }).catch(this.handleErrorResponse.bind(null, res));
    }

    /* Imap data delete */

    deleteTag = (req, res, next) => {
        if (req.params.type == tag().tagType.automatic || req.params.type == tag().tagType.manual || req.params.type == tag().tagType.default) {
            if (req.params.type == tag().tagType.default) {
                this._db.Tag.destroyDefault( req.email,this._db,req.params.tagId, req.params.type).then((status) => {
                    this.handleSuccessResponse(req, res, next, { status: status });
                }).catch(this.handleErrorResponse.bind(null, res));
            } else {
                this._db.Tag.destroy({ where: { id: req.params.tagId, type: req.params.type } })
                    .then((docs) => {
                        if (docs) {
                            req.email.update({ tag_id: { $all: [req.params.tagId] } }, { $pull: { tag_id: req.params.tagId } }, { multi: true })
                                .then((data) => {
                                    this.handleSuccessResponse(req, res, next, { status: "SUCCESS" });
                                })
                                .catch(this.handleErrorResponse.bind(null, res));
                        } else {
                            next(res.status(400).send({ message: "Invalid tagId" }));
                        }
                    }).catch(this.handleErrorResponse.bind(null, res));
            }
        } else {
            next(res.status(400).send({ message: "Invalid tag type " }));
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
                .then((data) => this.handleSuccessResponse(req, res, next, data))
                .catch(this.handleErrorResponse.bind(null, res));
        } else {
            next(new Error("Invalid Type"));
        }
    }

    /* Get all tag */
    getAllTag = (req, res, next) => {
        this._db.Tag.findAll({ order: '`priority` ASC' })
            .then((data) => this.handleSuccessResponse(req, res, next, data))
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
                .then((data) => this.handleSuccessResponse(req, res, next, data))
                .catch(this.handleErrorResponse.bind(null, res));
        } else {
            next(new Error("Invalid Type"));
        }
    }

    /* Get Imap data using id*/
    idResult = (req, res, next, tagId) => {
        this.getById(req, res, this._db.Tag, tagId, next);
    }

    /*Get Shedules*/
    getShedule = (req, res, next) => {
        email_process.getShedule(req.email)
            .then((result) => { this.handleSuccessResponse(req, res, next, result) })
            .catch(this.handleErrorResponse)
    }

    /*updatePriority*/
    updatePriority = (req, res, next) => {
        this._db.Tag.updatePriority(req.body).then((response) => {
            this.handleSuccessResponse(req, res, next, response)
        })
    }

}

const controller = new TagController();
export default controller;
import BaseAPIController from "./BaseAPIController";
import TagProvider from "../providers/TagProvider";
import tag from "../models/constant";
import _ from 'lodash';
import moment from 'moment';
import constant from "../models/constant";

export class TagController extends BaseAPIController {
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
                                        function assignTag(id) {
                                            var mongoId = id.splice(0, 100)
                                            req.email.update({
                                                    _id: { $in: mongoId }
                                                }, {
                                                    "$addToSet": {
                                                        "tag_id": data.id.toString()
                                                    },
                                                    "email_timestamp": new Date().getTime()
                                                }, {
                                                    multi: true
                                                })
                                                .then((data1) => {
                                                    if (!id.length) {
                                                        res.json({ message: "tag assigned sucessfully", data: data })
                                                    } else {
                                                        assignTag(id)
                                                    }
                                                })
                                        }
                                        assignTag(response)
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
        this._db.Tag.findAll({ order: '`id` ASC' })
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

    /*Get Shedules*/
    getShedule = (req, res, next) => {
        var slots_array = [];
        var list_array = [];
        var final_data_list = {}

        function getDates(startDate, stopDate, callback) {
            let prefixes = [1, 2, 3, 4, 5]
            var currentDate = moment(startDate);
            var stopDate = moment(stopDate);
            if (!(moment(currentDate).day() == 6 && !(prefixes[0 | moment(currentDate).date() / 7] % 2))) {
                if (!moment(currentDate).day() == 0) {
                    getTimeSlots(currentDate, function(time_slots) {
                        currentDate = moment(currentDate).add(1, 'days');
                        if (startDate <= stopDate) {
                            getDates(currentDate, stopDate, callback)
                        } else {
                            callback(time_slots);
                        }
                    })
                } else {
                    currentDate = moment(currentDate).add(1, 'days');
                    getDates(currentDate, stopDate, callback)
                }
            } else {
                currentDate = moment(currentDate).add(1, 'days');
                getDates(currentDate, stopDate, callback)
            }
        }

        function getTimeSlots(currentDate, callback) {
            slots_array = []
            final_data_list = {}
            var shedule_for = constant().shedule_for;
            var shedule_time_slots = [constant().first_round_slots, constant().second_round_slots, constant().third_round_slots];
            check_slot_status(shedule_for, shedule_time_slots, currentDate, function(response) {
                list_array.push({ date: currentDate.toISOString().substring(0, 10), time_slots: response })
                callback(list_array)
            })

        }

        function check_slot_status(shedule_type, shedule_slots, date, callback) {
            var shedule = shedule_type.splice(0, 1)[0]
            var slots = shedule_slots.splice(0, 1)[0]
            req.email.find({ shedule_date: date.toISOString().substring(0, 10), shedule_for: shedule }, { "shedule_time": 1 }).exec(function(err, shedule_time) {
                if (shedule_time.length) {
                    var time = []
                    _.forEach(shedule_time, (val, key) => {
                        time.push(val.shedule_time)
                    })
                    _.forEach(slots, (val, key) => {
                        if (time.indexOf(val) >= 0) {
                            slots_array.push({ time: time[time.indexOf(val)], status: 0 })
                        } else {
                            slots_array.push({ time: val, status: 1 })
                        }
                        if (key == slots.length - 1) {
                            final_data_list[shedule] = slots_array;
                            if (shedule_type.length) {
                                slots_array = []
                                check_slot_status(shedule_type, shedule_slots, date, callback)
                            } else {
                                final_data_list[shedule] = slots_array;
                                callback(final_data_list)
                            }
                        }
                    })
                } else {
                    _.forEach(slots, (val, key) => {
                        slots_array.push({ time: val, status: 1 })
                        if (key == slots.length - 1) {
                            final_data_list[shedule] = slots_array;
                            if (shedule_type.length) {
                                slots_array = []
                                check_slot_status(shedule_type, shedule_slots, date, callback)
                            } else {
                                final_data_list[shedule] = slots_array;
                                callback(final_data_list)
                            }
                        }
                    })
                }
            })

        }

        let lastDate = moment(new Date()).add(1, 'months');
        getDates(moment(new Date()).add(1, 'days'), lastDate, function(dateArray) {
            res.json(dateArray)
        })
    }

}

const controller = new TagController();
export default controller;
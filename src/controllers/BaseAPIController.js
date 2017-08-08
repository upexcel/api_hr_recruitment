import db from "../db";
import errorHandler from "../lib/util";
import userActivity from "../service/userActivity";

export default class BaseAPIController {
    constructor() {
        this._db = db;
    }

    handleErrorResponse(res, err, next) {
        res.status(400).send(errorHandler(err));
    }

    handleSuccessResponse(req, res, next, data) {
        userActivity.userActivityLogs(req, data)
            .then((response) => { res.json(data) })
    }

    getById(req, res, model, id, next) {
        model.findById(id)
            .then((data) => {
                if (data) {
                    req.result = data;
                    next();
                } else {
                    res.status(400).send(errorHandler("Invalid Id"));
                }
            });
    }

    getCount(req, res, next, where) {
        req.email.find(where).count().exec((err, data) => {
            if (err) {
                next(err);
            } else {
                req.count = data
                next()
            }
        });
    }
}
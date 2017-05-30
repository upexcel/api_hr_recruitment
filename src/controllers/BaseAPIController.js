import db from "../db";
import errorHandler from "../lib/util";

export default class BaseAPIController {
    constructor() {
        this._db = db;
    }

    handleErrorResponse(res, err, next) {
        res.status(400).send(errorHandler(err));
    }

    handleSuccessResponse(res, next) {
        res.json({
            status: "SUCCESS"
        });
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
}

import * as BaseProvider from "./BaseProvider";
import util from "util";
import tag from "../models/constant";

/* Provider for User Registration */
const save = (model, type, validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        if (type) {
            validate("title", "Title cannot be empty").notEmpty();
            validate("color", "color cannot be empty").notEmpty();
        } else if (type === tag().tagType.automatic) {
            validate("title", "Title cannot be empty").notEmpty();
            validate("color", "color cannot be empty").notEmpty();
        } else {
            reject("Invalid Type");
        }
        if (body.is_job_profile_tag)
            validate("job_description", "job_description cannot be empty").notEmpty();
        validationResult.then(function(result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                body.type = type;
                body.assign_to_all_emails = body.assign || body.assign_to_all_emails;
                delete body.assign;
                if (body.template_id == "") {
                    delete body.template_id;
                    if ((body.to == "" && body.from == "")) {
                        delete body.to;
                        delete body.from;
                    }
                    resolve(body)
                } else {
                    if ((body.to == "" && body.from == "")) {
                        delete body.to;
                        delete body.from;
                    }
                    resolve(body);
                }
            }
        });
    });
};
export default {
    BaseProvider,
    save,
};
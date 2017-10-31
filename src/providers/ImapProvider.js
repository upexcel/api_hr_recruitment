import * as BaseProvider from "./BaseProvider";
import util from "util";
import moment from "moment";

/* Provider for User Registration */
const save = (model, validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate("email", "email cannot be empty").notEmpty();
        validate("password", "password cannot be empty").notEmpty();
        validate("last_fetched_time", "Last Fetched Time cannot be empty");
        validationResult.then(function(result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                body.last_fetched_time = moment(body.last_fetched_time).format("YYYY-MM-DD")
                resolve(body);
            }
        });
    });
};
const statusActive = (model, validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate("email", "email cannot be empty").notEmpty();
        validationResult.then(function(result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                resolve(body);
            }
        });
    });
};
export default {
    BaseProvider,
    save,
    statusActive,
};
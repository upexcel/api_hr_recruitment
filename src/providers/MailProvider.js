import * as BaseProvider from "./BaseProvider";
import util from "util";

const changeUnreadStatus = (validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate("mongo_id", "mongo_id cannot be empty").notEmpty();
        validationResult.then(function(result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                resolve(body);
            }
        });
    });
};

const deleteEmail = (validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate("mongo_id", "mongo_id cannot be empty").notEmpty();
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
    changeUnreadStatus,
    deleteEmail
};

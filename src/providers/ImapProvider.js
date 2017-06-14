import * as BaseProvider from "./BaseProvider";
import util from "util";

/* Provider for User Registration */
const save = (model, validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate("email", "email cannot be empty").notEmpty();
        validate("password", "password cannot be empty").notEmpty();
        validationResult.then(function(result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
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

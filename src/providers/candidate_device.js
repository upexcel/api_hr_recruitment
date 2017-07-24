import * as BaseProvider from "./BaseProvider";
import util from "util";

/* Provider for User Registration */
const save = (validate, body, validationResult) => new Promise((resolve, reject) => {
    validate("email_id", "email_id cannot be empty").notEmpty();
    validate("device_id", "device_id cannot be empty").notEmpty();
    validate("token", "token cannot be empty").notEmpty();
    validationResult.then((result) => {
        if (!result.isEmpty()) {
            reject(result.array()[0].msg);
        } else {
            resolve(body);
        }
    });
});

export default {
    ...BaseProvider,
    save,
};
import * as BaseProvider from "./BaseProvider";
import util from "util";
import crypto from "crypto";

const updatePassword = (validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate("old_password", "old_password cannot be empty").notEmpty();
        validate("new_password", "new_password cannot be empty").notEmpty();
        validationResult.then(function(result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
            } else {
                body.old_password = crypto.createHash("sha256").update(body.old_password).digest("base64");
                body.new_password = crypto.createHash("sha256").update(body.new_password).digest("base64");
                resolve(body);
            }
        });
    });
};
export default {
    BaseProvider,
    updatePassword
};

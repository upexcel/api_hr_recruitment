import crypto from "crypto";
import * as BaseProvider from "./BaseProvider";
import util from "util";

/* Provider for User Registration */
const create = (model, validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate("email", "email cannot be empty").notEmpty();
        validate("user_type", "user_type cannot be empty").notEmpty();
        validate("password", "password cannot be empty").notEmpty();
        validate("confirm_password", "confirm_password cannot be empty").notEmpty();
        validationResult.then(function(result) {
            if (!result.isEmpty()) {
                reject(result.array()[0].msg);
                return;
            } else {
                if (body.password == body.confirm_password) {
                    delete body.confirm_password;
                    body.password = crypto.createHash("sha256").update(body.password).digest("base64");
                    resolve(body);
                } else {
                    reject("Password Not Matched");
                }
            }
        });
    });
};

/* Provider for User login */
const login = (model, body) => {
    let password = crypto.createHash("sha256").update(body.password).digest("base64");
    delete body.confirm_password;
    return {...body,
        ... {
            password
        }
    };

};
export default {
    ...BaseProvider,
    create,
    login,
};

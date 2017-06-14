import * as BaseProvider from "./BaseProvider";
import util from "util";

/* Provider for User Registration */
const save = (model, validate, body, validationResult) => new Promise((resolve, reject) => {
    validate("templateName", "Template Name cannot be empty").notEmpty();
    validate("subject", "Subject cannot be empty").notEmpty();
    validate("body", "Body cannot be empty").notEmpty();
    validationResult.then((result) => {
        if (!result.isEmpty()) {
            reject(result.array()[0].msg);
        } else {
            resolve(body);
        }
    });
});

const templateEmail = (model, validate, body, validationResult) => new Promise((resolve, reject) => {
    validate("subject", "Subject cannot be empty").notEmpty();
    validate("body", "body cannot be empty").notEmpty();
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
    templateEmail,
};

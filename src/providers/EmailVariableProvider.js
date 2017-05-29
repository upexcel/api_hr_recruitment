import * as BaseProvider from "./BaseProvider";
import util from "util";

/* Provider for User Registration */
const save = (model, validate, body, validationResult) => new Promise((resolve, reject) => {
    validate("variableCode", "variable Code cannot be empty").notEmpty();
    validate("variableValue", "variable Value cannot be empty").notEmpty();
    validationResult.then((result) => {
        if (!result.isEmpty()) {
            reject(util.inspect(result.array()));
        } else {
            resolve(body);
        }
    });
});

export default {
    ...BaseProvider,
    save,
};

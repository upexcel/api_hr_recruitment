import * as BaseProvider from "./BaseProvider";
import util from "util";

/* Provider for User Registration */
const assignTag = (validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate("tag_id", "tag_id cannot be empty").notEmpty();
        validationResult.then(function(result) {
            console.log('======================')
            console.log(result.isEmpty())
            console.log('======================')
            if (!result.isEmpty()) {
                reject(util.inspect(result.array()));
                return;
            } else {
                console.log('------------------')
                resolve(body);
                console.log(body)
                console.log('------------------')
            }
        });
    });
};
export default {
    BaseProvider,
    assignTag
};

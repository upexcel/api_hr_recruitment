import crypto from 'crypto';
import * as BaseProvider from './BaseProvider';
import util from 'util';

/* Provider for User Registration */
const save = (model, validate, body, validationResult) => {
    return new Promise((resolve, reject) => {
        validate('email', 'email cannot be empty').notEmpty();
        validate('smtp_server', 'smtp_server cannot be empty').notEmpty();
        validate('type', 'type cannot be empty').notEmpty();
        validate('password', 'password cannot be empty').notEmpty();
        validate('server_port', 'port cannot be empty and must be integer').notEmpty().isInt();
        validationResult.then(function(result) {
            if (!result.isEmpty()) {
                reject(util.inspect(result.array()));
                return;
            } else {
                resolve(body)
            }
        })
    })
};
export default {
    ...BaseProvider,
    save
};
